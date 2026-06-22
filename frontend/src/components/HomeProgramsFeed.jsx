import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function HomeProgramsFeed({ category, lat, lng }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (lat != null && lng != null) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
      params.set("radiusKm", "200");
    }
    API.get(`/public/programs-feed?${params.toString()}`)
      .then((r) => setPrograms(r.data))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, [category, lat, lng]);

  return (
    <section className="py-8 px-0">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <h2 className="text-2xl font-serif text-[#1e2a5e]">Programs from artists</h2>
        <p className="text-sm text-[#5c4f3d] max-w-md">
          Sorted by distance from your map pin when the program has a venue set.
        </p>
      </div>
      {loading ? (
        <p className="text-[#5c4f3d] text-sm">Loading programs…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl border border-[#1e2a5e]/12 bg-white p-5 shadow-sm flex flex-col"
            >
              <p className="text-xs uppercase tracking-wide text-[#c45c26] font-medium">
                {p.category || "Program"}
              </p>
              <h3 className="text-lg font-semibold text-[#1e2a5e] mt-1">{p.title}</h3>
              <p className="text-sm text-[#5c4f3d] mt-2 line-clamp-2 flex-1">
                {p.description}
              </p>
              <p className="text-sm text-[#2c2416] mt-3">
                {p.artistId?.name} · ₹{p.priceRupee}
              </p>
              {p.venue?.label && (
                <p className="text-xs text-[#7a6c58] mt-1">{p.venue.label}</p>
              )}
              <Link
                to={`/u/artists/${p.artistId?._id || p.artistId}`}
                className="mt-4 inline-block text-sm font-medium text-[#c45c26] hover:underline"
              >
                View artist & book →
              </Link>
            </div>
          ))}
        </div>
      )}
      {!loading && programs.length === 0 && (
        <p className="text-[#5c4f3d] text-sm">
          No programs match this filter. Try another category or ask artists to add venues
          to their programs for map-based discovery.
        </p>
      )}
    </section>
  );
}
