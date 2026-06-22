import { useEffect, useState } from "react";
import API from "../api";

export default function ArtistBookings() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const load = () =>
    API.get("/api/artist/bookings").then((r) => setRows(r.data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  async function act(id, action, rejectNote) {
    setMsg("");
    try {
      await API.patch(`/api/artist/bookings/${id}`, { action, rejectNote });
      await load();
    } catch (e) {
      setMsg(e.response?.data?.message || "Action failed");
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
        <h1 className="text-2xl font-serif text-[#f4e9d8] mb-2">Booking inbox</h1>
        <p className="text-white/60 text-sm">
          Accept or reject requests. After acceptance the guest chooses 50% or full payment.
        </p>
      </div>

      {msg && (
        <div className="rounded-2xl border border-amber-200/10 bg-amber-200/5 p-4 text-sm text-amber-100 mb-5">
          {msg}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b._id} className="border-t border-white/10">
                <td className="px-4 py-3 text-white/90">
                  {b.userId?.name}
                  <div className="text-xs text-white/50">{b.userId?.email}</div>
                </td>
                <td className="px-4 py-3 text-white/80">
                  {b.programId?.title}
                </td>
                <td className="px-4 py-3 text-white/80">{b.eventDate}</td>
                <td className="px-4 py-3 text-white/80">{b.status}</td>
                <td className="px-4 py-3 space-x-2">
                  {b.status === "REQUESTED" && (
                    <>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-medium"
                        onClick={() => act(b._id, "accept")}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium"
                        onClick={() => {
                          const note = window.prompt("Optional note for guest") || "";
                          act(b._id, "reject", note);
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mt-6">
          <p className="text-white/60 text-sm">No bookings yet.</p>
        </div>
      )}
    </div>
  );
}
