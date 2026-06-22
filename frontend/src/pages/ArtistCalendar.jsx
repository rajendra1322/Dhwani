import { useEffect, useState } from "react";
import API from "../api";

const LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ArtistCalendar() {
  const [weekly, setWeekly] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [dateInput, setDateInput] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [w, b] = await Promise.all([
      API.get("/api/artist/weekly"),
      API.get("/api/artist/blocked"),
    ]);
    setWeekly(w.data);
    setBlocked(b.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function saveWeekly(next) {
    setMsg("");
    try {
      const { data } = await API.put("/api/artist/weekly", { days: next });
      setWeekly(data);
    } catch (e) {
      setMsg(e.response?.data?.message || "Could not save");
    }
  }

  function toggleDay(dayOfWeek) {
    const map = new Map(weekly.map((w) => [w.dayOfWeek, w.isOpen]));
    const cur = map.has(dayOfWeek) ? map.get(dayOfWeek) : true;
    map.set(dayOfWeek, !cur);
    const days = Array.from({ length: 7 }, (_, d) => ({
      dayOfWeek: d,
      isOpen: map.has(d) ? map.get(d) : true,
    }));
    saveWeekly(days);
  }

  async function addBlock(e) {
    e.preventDefault();
    setMsg("");
    if (!dateInput) return;
    try {
      await API.post("/api/artist/blocked", { date: dateInput });
      setDateInput("");
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not block date");
    }
  }

  async function removeBlock(id) {
    await API.delete(`/api/artist/blocked/${id}`);
    await load();
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h1 className="text-2xl font-serif text-[#f4e9d8] mb-2">Calendar</h1>
          <p className="text-white/60 text-sm">
            Set your weekly availability, then block one-off dates for travel or rest.
          </p>
        </div>

        <h2 className="text-lg font-semibold text-[#f4e9d8] mb-3">Weekly open days</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LABELS.map((label, dayOfWeek) => {
            const row = weekly.find((w) => w.dayOfWeek === dayOfWeek);
            const open = row ? row.isOpen : true;
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(dayOfWeek)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  open
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                    : "border-white/15 bg-white/5 text-white/50"
                }`}
              >
                {label}
                <div className="text-xs mt-1 font-normal">
                  {open ? "Open" : "Closed"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#f4e9d8] mb-2">Block a date</h2>
        <form onSubmit={addBlock} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-white/50 mb-1">YYYY-MM-DD</label>
            <input
              type="date"
              className="rounded-xl bg-[#0f0d18] border border-white/15 px-3 py-2 text-sm text-white"
              onChange={(e) => setDateInput(e.target.value)}
              value={dateInput}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#c45c26] text-white text-sm font-medium"
          >
            Block day
          </button>
        </form>
        {msg && (
          <div className="rounded-2xl border border-amber-200/10 bg-amber-200/5 p-4 text-sm text-amber-100 mt-4">
            {msg}
          </div>
        )}
        <ul className="mt-6 space-y-2">
          {blocked.map((b) => (
            <li
              key={b._id}
              className="flex justify-between items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            >
              <span className="text-white/85">{b.date}</span>
              <button
                type="button"
                className="text-xs text-amber-200 hover:underline"
                onClick={() => removeBlock(b._id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
