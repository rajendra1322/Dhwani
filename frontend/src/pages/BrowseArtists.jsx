import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function BrowseArtists() {
  const [artists, setArtists] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    API.get("/public/artists")
      .then((r) => setArtists(r.data))
      .catch((e) => setErr(e.response?.data?.message || "Could not load artists"));
  }, []);

  return (
    <div>
      <div className="surface p-6 sm:p-8 mb-8">
        <h1 className="title-hero">Discover artists</h1>
        <p className="muted mt-2 max-w-2xl">
          Browse profiles, choose a program, then request a date. The artist accepts first;
          you pay after acceptance.
        </p>
      </div>
      {err && (
        <div className="rounded-2xl border border-red-600/10 bg-red-50 p-4 text-sm text-red-800 mb-5">
          {err}
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((a) => (
          <Link
            key={a.id}
            to={`/u/artists/${a.id}`}
            className="group card p-6 card-hover"
          >
            <h2 className="text-xl font-semibold text-[#1e2a5e] group-hover:text-[#c45c26]">
              {a.displayName}
            </h2>
            <p className="text-sm text-[#5c4f3d] mt-1">
              {[a.genre, a.city].filter(Boolean).join(" · ") || "Artist on Dhwani"}
            </p>
            {a.bio && (
              <p className="text-sm text-[#3d3429] mt-3 line-clamp-3">{a.bio}</p>
            )}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-medium text-[#c45c26]">View schedule</span>
              <span className="text-sm text-black/40">→</span>
            </div>
          </Link>
        ))}
      </div>
      {artists.length === 0 && !err && (
        <div className="surface p-6 sm:p-8 mt-8">
          <p className="muted">No artists yet. Ask an artist to register.</p>
        </div>
      )}
    </div>
  );
}
