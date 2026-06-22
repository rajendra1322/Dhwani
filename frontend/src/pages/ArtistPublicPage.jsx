import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import LocationPickerWithSearch from "../components/LocationPickerWithSearch.jsx";

function shortLocationLabel(label) {
  if (!label) return ""
  return label.split(",")[0].trim()
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthMatrix(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toYyyyMmDd(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export default function ArtistPublicPage() {
  const { artistId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [eventLocation, setEventLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
    label: "",
  });

  useEffect(() => {
    API.get(`/public/artists/${artistId}`)
      .then((r) => {
        setData(r.data);
        const first = r.data.programs?.[0]?._id;
        if (first) setSelectedProgramId(first);
        if (r.data.profile?.location?.lat != null && r.data.profile?.location?.lng != null) {
          setEventLocation({
            lat: r.data.profile.location.lat,
            lng: r.data.profile.location.lng,
            label: r.data.profile.location.label || "",
          });
        }
      })
      .catch((e) => setErr(e.response?.data?.message || "Failed to load artist"));
  }, [artistId]);

  const weeklyMap = useMemo(() => {
    const m = new Map();
    (data?.weekly || []).forEach((w) => m.set(w.dayOfWeek, w.isOpen));
    return m;
  }, [data]);

  const blockedSet = useMemo(
    () => new Set((data?.blocked || []).map((b) => b.date)),
    [data]
  );

  const bookedSet = useMemo(
    () => new Set(data?.bookedDates || []),
    [data]
  );

  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const grid = useMemo(() => monthMatrix(year, monthIndex), [year, monthIndex]);

  function dayState(dayNum) {
    if (!dayNum || !data) return "empty";
    const key = toYyyyMmDd(year, monthIndex, dayNum);
    const dow = new Date(year, monthIndex, dayNum).getDay();
    if (blockedSet.has(key)) return "blocked";
    if (bookedSet.has(key)) return "booked";
    if (weeklyMap.has(dow) && !weeklyMap.get(dow)) return "closed";
    return "open";
  }

  async function requestBooking(dateStr) {
    setBookingMsg("");
    if (!selectedProgramId) {
      setBookingMsg("Step 1: Please select a program first.");
      return;
    }
    try {
      await API.post("/api/user/bookings", {
        programId: selectedProgramId,
        eventDate: dateStr,
        eventLocation: shortLocationLabel(eventLocation.label || ""),
        eventLocationFull: eventLocation.label || "",
        eventLocationLat: eventLocation.lat,
        eventLocationLng: eventLocation.lng,
      });
      setBookingMsg(
        `Booking requested for ${dateStr} in ${shortLocationLabel(eventLocation.label || "your chosen location")}. Next: wait for artist acceptance, then pay from “My bookings”.`
      );
    } catch (e) {
      if (e.response?.status === 401) {
        setBookingMsg("Please log in as an attendee (user account) to request a booking.");
      } else {
        setBookingMsg(e.response?.data?.message || "Could not create booking");
      }
    }
  }

  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <p className="text-[#5c4f3d]">Loading…</p>;

  const displayName = data.profile?.displayName || data.artist?.name;
  const selectedProgram = (data.programs || []).find((p) => p._id === selectedProgramId);

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div className="space-y-10">
        <div className="surface p-6 sm:p-8">
          <Link to="/u/artists" className="text-sm text-[#1e2a5e] hover:underline">
            ← All artists
          </Link>
          <h1 className="mt-4 title-hero">{displayName}</h1>
          <p className="muted mt-2 max-w-2xl whitespace-pre-line">
            {data.profile?.bio || "Pick a program and request an available day."}
          </p>
        </div>

        <section className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="title-section">Step 1 — Choose a program</h2>
            {selectedProgram && (
              <span className="badge badge-neutral">Selected</span>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {(data.programs || []).map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => {
                  setSelectedProgramId(p._id);
                  setBookingMsg("");
                }}
                className={`text-left card p-5 card-hover ${
                  selectedProgramId === p._id
                    ? "border-[#c45c26]/50 ring-2 ring-[#c45c26]/15 bg-[#fff7f0]"
                    : ""
                }`}
              >
                <h3 className="font-semibold text-[#1e2a5e]">{p.title}</h3>
                <p className="muted mt-1 line-clamp-2">{p.description}</p>
                <p className="text-sm font-semibold text-[#c45c26] mt-4">
                  ₹{p.priceRupee} · {p.durationMinutes} min
                </p>
              </button>
            ))}
          </div>
          {(!data.programs || data.programs.length === 0) && (
            <p className="muted">No programs listed yet.</p>
          )}
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="title-section">Step 2 — Pick an open date</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setCursor(new Date(year, monthIndex - 1, 1))}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setCursor(new Date(year, monthIndex + 1, 1))}
              >
                Next
              </button>
            </div>
          </div>
          <p className="muted mb-5">
            {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </p>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-black/50 mb-2">
            {DAY_NAMES.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {grid.map((d, i) => {
              const st = d ? dayState(d) : "empty";
              const key = d ? toYyyyMmDd(year, monthIndex, d) : `pad-${i}`;
              const dateStr = d ? toYyyyMmDd(year, monthIndex, d) : "";
              const isSelected = selectedDate && dateStr === selectedDate;

              const base =
                "min-h-14 rounded-xl border text-sm flex flex-col items-center justify-center gap-1";
              const styles =
                st === "open"
                  ? "border-emerald-700/15 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 cursor-pointer"
                  : st === "blocked"
                    ? "border-red-700/15 bg-red-50 text-red-950"
                    : st === "booked"
                      ? "border-amber-700/15 bg-amber-50 text-amber-950"
                      : st === "closed"
                        ? "border-black/5 bg-black/[0.03] text-black/40"
                        : "border-transparent";

              return (
                <button
                  key={key}
                  type="button"
                  disabled={st !== "open"}
                  onClick={() => {
                    if (!d) return;
                    setSelectedDate(dateStr);
                    setBookingMsg("");
                  }}
                  className={`${base} ${styles} ${isSelected ? "ring-2 ring-[#1e2a5e]/20 border-[#1e2a5e]/25" : ""}`}
                  aria-label={d ? `${dateStr} ${st}` : "Empty"}
                >
                  {d ? (
                    <>
                      <span className="font-semibold">{d}</span>
                      <span className="text-[10px] font-medium">
                        {st === "open"
                          ? "Open"
                          : st === "blocked"
                            ? "Blocked"
                            : st === "booked"
                              ? "Booked"
                              : "Closed"}
                      </span>
                    </>
                  ) : (
                    <span />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-5 text-xs text-black/60">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-800/20" />
              Open
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-50 border border-red-800/20" />
              Blocked
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-50 border border-amber-800/20" />
              Booked
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-black/[0.03] border border-black/10" />
              Closed weekday
            </span>
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="title-section">Step 2.5 - Event location</h2>
            <span className="badge badge-neutral">Shown to artist</span>
          </div>
          <p className="muted mb-4">
            Add the venue or event area so the artist can review the request with the right context.
          </p>
          {eventLocation.label && (
            <div className="mb-4 rounded-xl border border-[#1e2a5e]/10 bg-[#1e2a5e]/[0.03] px-4 py-3 text-sm text-[#1e2a5e]">
              Selected: <span className="font-semibold">{shortLocationLabel(eventLocation.label)}</span>
            </div>
          )}
          <LocationPickerWithSearch
            value={eventLocation}
            onChange={(next) => setEventLocation((prev) => ({ ...prev, ...next }))}
            height={260}
          />
        </section>
      </div>

      <aside className="lg:sticky lg:top-6 h-fit space-y-4">
        <div className="surface p-6">
          <h3 className="text-base font-semibold text-[#1e2a5e]">Step 3 — Request booking</h3>
          <p className="muted mt-2">
            You’ll request a date first. After the artist accepts, you can pay (50% or full) from
            “My bookings”.
          </p>

          <div className="mt-5 space-y-3">
            <div className="card p-4 bg-white">
              <p className="text-xs text-black/50">Program</p>
              <p className="font-semibold text-[#1e2a5e]">
                {selectedProgram?.title || "Select a program"}
              </p>
              {selectedProgram && (
                <p className="text-sm font-semibold text-[#c45c26] mt-1">
                  ₹{selectedProgram.priceRupee}
                </p>
              )}
            </div>

            <div className="card p-4 bg-white">
              <p className="text-xs text-black/50">Date</p>
              <p className="font-semibold text-[#1e2a5e]">
                {selectedDate || "Select an open date"}
              </p>
            </div>

            <div className="card p-4 bg-white">
              <p className="text-xs text-black/50">Location</p>
              <p className="font-semibold text-[#1e2a5e]">
                {shortLocationLabel(eventLocation.label) || "Search and select a location"}
              </p>
              {eventLocation.label && (
                <p className="mt-1 line-clamp-2 text-xs text-[#5c4f3d]">{eventLocation.label}</p>
              )}
            </div>

            <button
              type="button"
              className="btn btn-accent w-full py-3"
              disabled={!selectedProgramId || !selectedDate}
              onClick={() => requestBooking(selectedDate)}
            >
              Request booking
            </button>

            {bookingMsg && (
              <div className="rounded-xl border border-[#1e2a5e]/10 bg-[#1e2a5e]/[0.03] p-4 text-sm text-[#1e2a5e]">
                {bookingMsg}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
