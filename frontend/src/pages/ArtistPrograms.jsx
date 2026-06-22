import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function ArtistPrograms() {
  const [programs, setPrograms] = useState([]);

  const load = () =>
    API.get("/api/artist/programs").then((r) => setPrograms(r.data));

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function remove(id) {
    if (!window.confirm("Delete this program?")) return;
    await API.delete(`/api/artist/programs/${id}`);
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif text-[#f4e9d8]">Programs</h1>
          <p className="text-white/60 text-sm mt-1">
            What you offer, with clear pricing and duration.
          </p>
        </div>
        <Link
          to="/a/programs/new"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-[#c45c26] text-white text-sm font-medium hover:bg-[#a34c1f]"
        >
          New program
        </Link>
      </div>
      <div className="space-y-3">
        {programs.map((p) => (
          <div
            key={p._id}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex flex-wrap justify-between gap-3 hover:bg-white/[0.07] transition"
          >
            <div>
              <p className="font-medium text-[#f4e9d8]">{p.title}</p>
              <p className="text-xs text-white/50 mt-1">
                ₹{p.priceRupee} · {p.durationMinutes} min ·{" "}
                {p.isActive ? "Active" : "Hidden"}
              </p>
              {p.venue?.label && (
                <p className="text-xs text-white/50 mt-1">Venue: {p.venue.label}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(p._id)}
              className="text-xs text-amber-200 hover:underline self-center"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {programs.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/60 text-sm">No programs yet. Create your first one.</p>
        </div>
      )}
    </div>
  );
}
