import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  User,
  ArtistProfile,
  Program,
  WeeklyAvailability,
  BlockedDate,
  Booking,
} from "./models.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dhwanievents.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dhwani";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const PAYMENT_WINDOW_MS =
  (parseInt(process.env.PAYMENT_WINDOW_MINUTES || "30", 10) || 30) * 60 * 1000;

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

const COMPANY_NAME = process.env.COMPANY_NAME || "Dhwani Events Pvt. Ltd.";
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || "";
const COMPANY_GSTIN = process.env.COMPANY_GSTIN || "";

const BALANCE_PAY_MS = 7 * 24 * 60 * 60 * 1000;

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function bookingProgramPricePaise(booking, program) {
  if (booking.programPricePaise && booking.programPricePaise > 0) {
    return booking.programPricePaise;
  }
  return Math.round(Number(program?.priceRupee || 0) * 100);
}

async function createRazorpayOrder({ amount, currency, receipt, notes }) {
  const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString(
    "base64"
  );
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Razorpay order failed: ${res.status}`);
  }
  return JSON.parse(text);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

async function expireStaleBookings() {
  const now = new Date();
  await Booking.updateMany(
    {
      status: "ACCEPTED",
      paymentDeadline: { $ne: null, $lt: now },
    },
    { $set: { status: "EXPIRED" } }
  );
}

function dayOfWeekForYyyyMmDd(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).getDay();
}

function isValidYyyyMmDd(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

async function ensureWeeklyDefaults(artistId) {
  const count = await WeeklyAvailability.countDocuments({ artistId });
  if (count === 0) {
    await WeeklyAvailability.insertMany(
      Array.from({ length: 7 }, (_, dayOfWeek) => ({
        artistId,
        dayOfWeek,
        isOpen: true,
      }))
    );
  }
}

async function findBlockingBooking(artistId, eventDate) {
  return Booking.findOne({
    artistId,
    eventDate,
    status: {
      $in: ["REQUESTED", "ACCEPTED", "PARTIALLY_PAID", "PAID"],
    },
  });
}

// ---------- Auth (shared) ----------
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["user", "artist"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    return res.status(201).json({ message: "Registered Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (role === "admin") {
      if (email === "admin@dhwani.com" && password === "admin123") {
        const token = jwt.sign(
          { role: "admin", email },
          JWT_SECRET,
          { expiresIn: "1d" }
        );
        return res.json({
          message: "Admin Login Success",
          token,
          user: { email, role: "admin" },
        });
      }
      return res.status(400).json({ message: "Invalid Admin Credentials" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== role) {
      return res.status(400).json({ message: "Role mismatch" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password: _, ...safeUser } = user.toObject();
    return res.json({
      message: "Login Success",
      token,
      user: safeUser,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/profile", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.json({ email: req.user.email, role: "admin" });
    }
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Public ----------
app.get("/public/artists", async (_req, res) => {
  try {
    const artists = await User.find({ role: "artist" })
      .select("name email")
      .lean();
    const profiles = await ArtistProfile.find().lean();
    const byUserId = new Map(
      profiles.map((p) => [p.userId.toString(), p])
    );
    const list = artists.map((a) => {
      const p = byUserId.get(a._id.toString());
      return {
        id: a._id,
        displayName: p?.displayName || a.name,
        genre: p?.genre || "",
        city: p?.city || "",
        bio: p?.bio || "",
      };
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/public/artists/:artistId", async (req, res) => {
  try {
    const { artistId } = req.params;
    const artist = await User.findById(artistId).select("name email role");
    if (!artist || artist.role !== "artist") {
      return res.status(404).json({ message: "Artist not found" });
    }
    const profile =
      (await ArtistProfile.findOne({ userId: artistId })) ||
      (await ArtistProfile.create({
        userId: artistId,
        displayName: artist.name,
      }));
    await ensureWeeklyDefaults(artist._id);
    const [programs, weekly, blocked] = await Promise.all([
      Program.find({ artistId, isActive: true }).sort({ createdAt: -1 }),
      WeeklyAvailability.find({ artistId }).sort({ dayOfWeek: 1 }),
      BlockedDate.find({ artistId }).sort({ date: 1 }),
    ]);
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 120);
    const from = new Date().toISOString().slice(0, 10);
    const to = horizon.toISOString().slice(0, 10);
    const bookedDates = await Booking.distinct("eventDate", {
      artistId,
      eventDate: { $gte: from, $lte: to },
      status: {
        $in: ["REQUESTED", "ACCEPTED", "PARTIALLY_PAID", "PAID"],
      },
    });
    res.json({
      artist: {
        id: artist._id,
        name: artist.name,
        email: artist.email,
      },
      profile,
      programs,
      weekly,
      blocked,
      bookedDates,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/public/program-categories", async (_req, res) => {
  try {
    const cats = await Program.distinct("category", {
      isActive: true,
      category: { $nin: ["", null] },
    });
    res.json(cats.filter(Boolean).sort((a, b) => a.localeCompare(b)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/public/programs-feed", async (req, res) => {
  try {
    const { category, lat, lng, radiusKm } = req.query;
    const q = { isActive: true };
    if (category && String(category).trim()) {
      q.category = new RegExp(`^${escapeRegex(String(category).trim())}$`, "i");
    }
    let programs = await Program.find(q)
      .populate("artistId", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const latN = lat != null && lat !== "" ? Number(lat) : null;
    const lngN = lng != null && lng !== "" ? Number(lng) : null;
    const R = radiusKm != null && radiusKm !== "" ? Number(radiusKm) : 100;

    if (
      latN != null &&
      lngN != null &&
      !Number.isNaN(latN) &&
      !Number.isNaN(lngN)
    ) {
      const scored = programs.map((p) => {
        const plat = p.venue?.lat;
        const plng = p.venue?.lng;
        let d = Infinity;
        if (plat != null && plng != null && !Number.isNaN(plat) && !Number.isNaN(plng)) {
          d = haversineKm(latN, lngN, plat, plng);
        }
        return { p, d };
      });
      scored.sort((a, b) => {
        const inA = a.d <= R ? a.d : 10000 + a.d;
        const inB = b.d <= R ? b.d : 10000 + b.d;
        return inA - inB;
      });
      programs = scored.map((x) => x.p);
    }

    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Artist API ----------
app.get(
  "/api/artist/profile",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      let profile = await ArtistProfile.findOne({ userId: req.user.id });
      if (!profile) {
        const u = await User.findById(req.user.id);
        profile = await ArtistProfile.create({
          userId: req.user.id,
          displayName: u?.name || "",
        });
      }
      await ensureWeeklyDefaults(req.user.id);
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  "/api/artist/profile",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const { displayName, bio, genre, city, location } = req.body;
      const $set = {
        displayName: displayName ?? "",
        bio: bio ?? "",
        genre: genre ?? "",
        city: city ?? "",
      };
      if (location && typeof location === "object") {
        if (location.lat != null) $set["location.lat"] = Number(location.lat);
        if (location.lng != null) $set["location.lng"] = Number(location.lng);
        if (location.label != null) $set["location.label"] = String(location.label);
      }
      const profile = await ArtistProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      await ensureWeeklyDefaults(req.user.id);
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/api/artist/programs",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const programs = await Program.find({ artistId: req.user.id }).sort({
        createdAt: -1,
      });
      res.json(programs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  "/api/artist/programs",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const {
        title,
        category,
        description,
        priceRupee,
        durationMinutes,
        isActive,
        venue,
      } = req.body;
      if (!title || priceRupee == null) {
        return res
          .status(400)
          .json({ message: "title and priceRupee are required" });
      }
      const program = await Program.create({
        artistId: req.user.id,
        title,
        category: category || "",
        description: description || "",
        priceRupee: Number(priceRupee),
        durationMinutes: Number(durationMinutes) || 120,
        isActive: isActive !== false,
        venue: {
          lat: venue?.lat != null ? Number(venue.lat) : null,
          lng: venue?.lng != null ? Number(venue.lng) : null,
          label: venue?.label != null ? String(venue.label) : "",
        },
      });
      res.status(201).json(program);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  "/api/artist/programs/:id",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const program = await Program.findOneAndUpdate(
        { _id: req.params.id, artistId: req.user.id },
        { $set: req.body },
        { new: true }
      );
      if (!program) return res.status(404).json({ message: "Not found" });
      res.json(program);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  "/api/artist/programs/:id",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const r = await Program.deleteOne({
        _id: req.params.id,
        artistId: req.user.id,
      });
      if (r.deletedCount === 0)
        return res.status(404).json({ message: "Not found" });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/api/artist/weekly",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      await ensureWeeklyDefaults(req.user.id);
      const weekly = await WeeklyAvailability.find({
        artistId: req.user.id,
      }).sort({ dayOfWeek: 1 });
      res.json(weekly);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  "/api/artist/weekly",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const { days } = req.body;
      if (!Array.isArray(days)) {
        return res.status(400).json({ message: "days array required" });
      }
      await ensureWeeklyDefaults(req.user.id);
      for (const row of days) {
        const { dayOfWeek, isOpen } = row;
        if (dayOfWeek == null || typeof isOpen !== "boolean") continue;
        await WeeklyAvailability.updateOne(
          { artistId: req.user.id, dayOfWeek: Number(dayOfWeek) },
          { $set: { isOpen } }
        );
      }
      const weekly = await WeeklyAvailability.find({
        artistId: req.user.id,
      }).sort({ dayOfWeek: 1 });
      res.json(weekly);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/api/artist/blocked",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const blocked = await BlockedDate.find({ artistId: req.user.id }).sort({
        date: 1,
      });
      res.json(blocked);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  "/api/artist/blocked",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const { date, note } = req.body;
      if (!isValidYyyyMmDd(date)) {
        return res.status(400).json({ message: "date must be YYYY-MM-DD" });
      }
      const row = await BlockedDate.findOneAndUpdate(
        { artistId: req.user.id, date },
        { $set: { fullDay: true, note: note || "" } },
        { new: true, upsert: true }
      );
      res.status(201).json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  "/api/artist/blocked/:id",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      const r = await BlockedDate.deleteOne({
        _id: req.params.id,
        artistId: req.user.id,
      });
      if (r.deletedCount === 0)
        return res.status(404).json({ message: "Not found" });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/api/artist/bookings",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      await expireStaleBookings();
      const bookings = await Booking.find({ artistId: req.user.id })
        .sort({ createdAt: -1 })
        .populate("userId", "name email")
        .populate("programId");
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.patch(
  "/api/artist/bookings/:id",
  verifyToken,
  requireRole("artist"),
  async (req, res) => {
    try {
      await expireStaleBookings();
      const { action, rejectNote } = req.body;
      const booking = await Booking.findOne({
        _id: req.params.id,
        artistId: req.user.id,
      }).populate("programId");
      if (!booking) return res.status(404).json({ message: "Not found" });
      if (booking.status !== "REQUESTED") {
        return res.status(400).json({ message: "Booking is not pending" });
      }
      if (action === "reject") {
        booking.status = "REJECTED";
        booking.rejectNote = rejectNote || "";
        booking.paymentDeadline = null;
        await booking.save();
        return res.json(booking);
      }
      if (action === "accept") {
        const program = booking.programId;
        const programPricePaise = Math.round(Number(program.priceRupee) * 100);
        booking.status = "ACCEPTED";
        booking.programPricePaise = programPricePaise;
        booking.totalPaidPaise = 0;
        booking.balanceDuePaise = programPricePaise;
        booking.razorpayOrderId = "";
        booking.amountPaise = 0;
        booking.pendingCheckoutMode = "";
        booking.paymentDeadline = new Date(Date.now() + PAYMENT_WINDOW_MS);
        await booking.save();
        return res.json({
          booking,
          message:
            "Booking accepted. The guest will choose 50% or full payment at checkout.",
        });
      }
      return res.status(400).json({ message: "Invalid action" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ---------- User API ----------
app.post(
  "/api/user/bookings",
  verifyToken,
  requireRole("user"),
  async (req, res) => {
    try {
      await expireStaleBookings();
      const { programId, eventDate } = req.body;
      if (!programId || !eventDate) {
        return res
          .status(400)
          .json({ message: "programId and eventDate required" });
      }
      if (!isValidYyyyMmDd(eventDate)) {
        return res.status(400).json({ message: "eventDate must be YYYY-MM-DD" });
      }
      const program = await Program.findById(programId);
      if (!program || !program.isActive) {
        return res.status(404).json({ message: "Program not found" });
      }
      const artistId = program.artistId.toString();
      const dow = dayOfWeekForYyyyMmDd(eventDate);
      if (dow === null) {
        return res.status(400).json({ message: "Invalid date" });
      }
      await ensureWeeklyDefaults(program.artistId);
      const weekly = await WeeklyAvailability.findOne({
        artistId: program.artistId,
        dayOfWeek: dow,
      });
      if (weekly && !weekly.isOpen) {
        return res.status(400).json({ message: "Artist is closed on this weekday" });
      }
      const blocked = await BlockedDate.findOne({
        artistId: program.artistId,
        date: eventDate,
      });
      if (blocked) {
        return res.status(400).json({ message: "This date is blocked by the artist" });
      }
      const clash = await findBlockingBooking(program.artistId, eventDate);
      if (clash) {
        return res.status(409).json({ message: "This date already has an active booking" });
      }
      const programPricePaise = Math.round(Number(program.priceRupee) * 100);
      const booking = await Booking.create({
        userId: req.user.id,
        artistId: program.artistId,
        programId: program._id,
        eventDate,
        status: "REQUESTED",
        programPricePaise,
        totalPaidPaise: 0,
        balanceDuePaise: programPricePaise,
        amountPaise: 0,
      });
      const populated = await booking.populate("programId");
      res.status(201).json(populated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/api/user/bookings",
  verifyToken,
  requireRole("user"),
  async (req, res) => {
    try {
      await expireStaleBookings();
      const bookings = await Booking.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate("programId")
        .populate("artistId", "name email");
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  "/api/user/location",
  verifyToken,
  requireRole("user"),
  async (req, res) => {
    try {
      const { lat, lng, label } = req.body;
      if (lat == null || lng == null) {
        return res.status(400).json({ message: "lat and lng required" });
      }
      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            "location.lat": Number(lat),
            "location.lng": Number(lng),
            "location.label": label != null ? String(label) : "",
          },
        },
        { new: true }
      ).select("-password");
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/api/user/bookings/:id",
  verifyToken,
  requireRole("user"),
  async (req, res) => {
    try {
      await expireStaleBookings();
      const booking = await Booking.findOne({
        _id: req.params.id,
        userId: req.user.id,
      })
        .populate("programId")
        .populate("artistId", "name email");
      if (!booking) return res.status(404).json({ message: "Not found" });
      const full = bookingProgramPricePaise(booking, booking.programId);
      const totalPaid = booking.totalPaidPaise || 0;
      const balance = Math.max(0, full - totalPaid);
      const payload = booking.toObject();
      payload.paymentSummary = {
        programPricePaise: full,
        totalPaidPaise: totalPaid,
        balanceDuePaise: balance,
        paymentDeadline: booking.paymentDeadline,
        canCheckoutHalf:
          booking.status === "ACCEPTED" && balance === full && full > 0,
        canCheckoutFull:
          booking.status === "ACCEPTED" && balance === full && full > 0,
        canCheckoutBalance:
          booking.status === "PARTIALLY_PAID" && balance > 0,
      };
      res.json(payload);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  "/api/user/bookings/:id/checkout",
  verifyToken,
  requireRole("user"),
  async (req, res) => {
    try {
      await expireStaleBookings();
      if (!razorpayKeyId || !razorpayKeySecret) {
        return res.status(503).json({
          message:
            "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        });
      }
      const { mode } = req.body;
      const booking = await Booking.findOne({
        _id: req.params.id,
        userId: req.user.id,
      }).populate("programId");
      if (!booking) return res.status(404).json({ message: "Not found" });

      const full = bookingProgramPricePaise(booking, booking.programId);
      const balance = Math.max(0, full - (booking.totalPaidPaise || 0));

      let orderAmountPaise;
      let checkoutMode;

      if (booking.status === "ACCEPTED") {
        if (mode !== "HALF" && mode !== "FULL") {
          return res.status(400).json({ message: "mode must be HALF or FULL" });
        }
        if (balance !== full) {
          return res.status(400).json({ message: "Invalid payment state" });
        }
        checkoutMode = mode;
        orderAmountPaise =
          mode === "HALF" ? Math.floor(full / 2) : full;
        if (orderAmountPaise < 100) {
          return res.status(400).json({ message: "Amount too small for checkout" });
        }
        if (
          booking.paymentDeadline &&
          new Date() > new Date(booking.paymentDeadline)
        ) {
          booking.status = "EXPIRED";
          await booking.save();
          return res.status(400).json({ message: "Payment window expired" });
        }
      } else if (booking.status === "PARTIALLY_PAID") {
        checkoutMode = "BALANCE";
        orderAmountPaise = balance;
        if (orderAmountPaise < 100) {
          return res.status(400).json({ message: "Nothing left to pay" });
        }
        if (
          booking.paymentDeadline &&
          new Date() > new Date(booking.paymentDeadline)
        ) {
          booking.status = "EXPIRED";
          await booking.save();
          return res.status(400).json({ message: "Balance payment window expired" });
        }
      } else {
        return res.status(400).json({ message: "Booking is not payable right now" });
      }

      const receipt = `bk_${booking._id}_${Date.now()}`.slice(0, 40);
      const order = await createRazorpayOrder({
        amount: orderAmountPaise,
        currency: "INR",
        receipt,
        notes: {
          bookingId: booking._id.toString(),
          mode: checkoutMode,
        },
      });

      booking.razorpayOrderId = order.id;
      booking.amountPaise = orderAmountPaise;
      booking.pendingCheckoutMode = checkoutMode;
      await booking.save();

      res.json({
        keyId: razorpayKeyId,
        orderId: order.id,
        amount: orderAmountPaise,
        currency: "INR",
        paymentDeadline: booking.paymentDeadline,
        mode: checkoutMode,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  "/api/user/bookings/:id/verify-payment",
  verifyToken,
  requireRole("user"),
  async (req, res) => {
    try {
      await expireStaleBookings();
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "Missing payment fields" });
      }
      const booking = await Booking.findOne({
        _id: req.params.id,
        userId: req.user.id,
      }).populate("programId");
      if (!booking) return res.status(404).json({ message: "Not found" });

      const ids = booking.razorpayPaymentIds || [];
      if (ids.includes(razorpay_payment_id)) {
        const populated = await Booking.findById(booking._id)
          .populate("programId")
          .populate("artistId", "name email");
        return res.json({ booking: populated, alreadyPaid: true });
      }

      if (booking.status === "PAID") {
        const populated = await Booking.findById(booking._id)
          .populate("programId")
          .populate("artistId", "name email");
        return res.json({ booking: populated, alreadyPaid: true });
      }

      if (booking.status !== "ACCEPTED" && booking.status !== "PARTIALLY_PAID") {
        return res.status(400).json({ message: "Booking is not awaiting payment" });
      }

      if (booking.status === "ACCEPTED") {
        if (
          booking.paymentDeadline &&
          new Date() > new Date(booking.paymentDeadline)
        ) {
          booking.status = "EXPIRED";
          await booking.save();
          return res.status(400).json({ message: "Payment window expired" });
        }
      } else if (booking.status === "PARTIALLY_PAID") {
        if (
          booking.paymentDeadline &&
          new Date() > new Date(booking.paymentDeadline)
        ) {
          booking.status = "EXPIRED";
          await booking.save();
          return res.status(400).json({ message: "Balance payment window expired" });
        }
      }

      if (booking.razorpayOrderId !== razorpay_order_id) {
        return res.status(400).json({ message: "Order mismatch" });
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(body)
        .digest("hex");
      if (expected !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid signature" });
      }

      const paidThis = booking.amountPaise || 0;
      const full = bookingProgramPricePaise(booking, booking.programId);
      booking.programPricePaise = full;
      booking.totalPaidPaise = (booking.totalPaidPaise || 0) + paidThis;
      booking.balanceDuePaise = Math.max(0, full - booking.totalPaidPaise);
      booking.razorpayPaymentIds = [...ids, razorpay_payment_id];
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpayOrderId = "";
      booking.pendingCheckoutMode = "";
      booking.amountPaise = 0;

      if (booking.balanceDuePaise <= 0) {
        booking.status = "PAID";
        booking.paymentDeadline = null;
      } else {
        booking.status = "PARTIALLY_PAID";
        booking.paymentDeadline = new Date(Date.now() + BALANCE_PAY_MS);
      }

      await booking.save();
      const populated = await Booking.findById(booking._id)
        .populate("programId")
        .populate("artistId", "name email");
      res.json({ booking: populated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get(
  "/api/user/bookings/:id/invoice-data",
  verifyToken,
  requireRole("user"),
  async (req, res) => {
    try {
      const booking = await Booking.findOne({
        _id: req.params.id,
        userId: req.user.id,
      })
        .populate("programId")
        .populate("artistId", "name email");
      if (!booking) return res.status(404).json({ message: "Not found" });
      if ((booking.totalPaidPaise || 0) <= 0) {
        return res.status(400).json({ message: "No payment recorded for this booking" });
      }
      const user = await User.findById(req.user.id).select("name email");
      const full = bookingProgramPricePaise(booking, booking.programId);
      const paid = booking.totalPaidPaise || 0;
      const balance = Math.max(0, full - paid);
      res.json({
        company: {
          name: COMPANY_NAME,
          address: COMPANY_ADDRESS,
          gstin: COMPANY_GSTIN,
        },
        guest: { name: user?.name, email: user?.email },
        booking: {
          id: booking._id,
          eventDate: booking.eventDate,
          programTitle: booking.programId?.title,
          artistName: booking.artistId?.name,
          programPricePaise: full,
          totalPaidPaise: paid,
          balanceDuePaise: balance,
          status: booking.status,
        },
        reference: `DH-${String(booking._id).slice(-10).toUpperCase()}`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/config/public", (_req, res) => {
  res.json({
    razorpayKeyId: razorpayKeyId || null,
    companyName: COMPANY_NAME,
    companyAddress: COMPANY_ADDRESS,
    companyGstin: COMPANY_GSTIN,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
