import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "artist"], required: true },
  /** Saved from attendee map (Leaflet) */
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    label: { type: String, default: "" },
  },
});

const artistProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    genre: { type: String, default: "" },
    city: { type: String, default: "" },
    /** Default service area for programs without their own pin */
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      label: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const programSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String, default: "" },
    description: { type: String, default: "" },
    priceRupee: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, default: 120 },
    isActive: { type: Boolean, default: true },
    /** Where the program is offered (for map + radius filter on home) */
    venue: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      label: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

/** 0 = Sunday … 6 = Saturday (JS getUTCDay style; client sends same convention for consistency) */
const weeklyAvailabilitySchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);
weeklyAvailabilitySchema.index({ artistId: 1, dayOfWeek: 1 }, { unique: true });

const blockedDateSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** YYYY-MM-DD calendar date (artist-local intent; stored as plain string) */
    date: { type: String, required: true },
    fullDay: { type: Boolean, default: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);
blockedDateSchema.index({ artistId: 1, date: 1 }, { unique: true });

const BOOKING_STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "PARTIALLY_PAID",
  "PAID",
  "REJECTED",
  "EXPIRED",
];

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    eventDate: { type: String, required: true },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "REQUESTED",
    },
    /** Full program price in paise (snapshot) */
    programPricePaise: { type: Number, default: 0 },
    /** Sum of successful Razorpay captures for this booking */
    totalPaidPaise: { type: Number, default: 0 },
    /** Remaining after payments */
    balanceDuePaise: { type: Number, default: 0 },
    /** Current Razorpay order amount in paise (this checkout only) */
    amountPaise: { type: Number, default: 0 },
    /** What the user chose for the current / last checkout */
    pendingCheckoutMode: {
      type: String,
      default: "",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpayPaymentIds: { type: [String], default: [] },
    paymentDeadline: { type: Date, default: null },
    rejectNote: { type: String, default: "" },
  },
  { timestamps: true }
);
bookingSchema.index({ artistId: 1, status: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

export const User = mongoose.model("User", userSchema);
export const ArtistProfile = mongoose.model("ArtistProfile", artistProfileSchema);
export const Program = mongoose.model("Program", programSchema);
export const WeeklyAvailability = mongoose.model(
  "WeeklyAvailability",
  weeklyAvailabilitySchema
);
export const BlockedDate = mongoose.model("BlockedDate", blockedDateSchema);
export const Booking = mongoose.model("Booking", bookingSchema);
export { BOOKING_STATUSES };
