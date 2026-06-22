import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const LABEL = {
  REQUESTED: "Requested",
  ACCEPTED: "Accepted — pay",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export default function HomeBookingsPreview() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    API.get("/api/user/bookings")
      .then((r) => setRows(r.data.slice(0, 5)))
      .catch(() => setRows([]));
  }, []);

  if (rows.length === 0) return null;

  return (
    <section className="py-8 border-t border-[#1e2a5e]/10">
      <div className="flex justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-serif text-[#1e2a5e]">Your bookings</h2>
        <Link to="/u/bookings" className="text-sm font-medium text-[#c45c26] hover:underline">
          View all
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((b) => (
          <div
            key={b._id}
            className="rounded-xl border border-[#1e2a5e]/12 bg-white px-4 py-3 text-sm"
          >
            <p className="font-semibold text-[#1e2a5e]">{b.programId?.title}</p>
            <p className="text-[#5c4f3d] mt-1">
              {b.artistId?.name} · {b.eventDate}
            </p>
            <p className="text-xs text-[#7a6c58] mt-2">{LABEL[b.status] || b.status}</p>
            {b.totalPaidPaise > 0 && (
              <p className="text-xs text-emerald-800 mt-1">
                Paid ₹{((b.totalPaidPaise || 0) / 100).toFixed(2)} / ₹
                {((b.programPricePaise || (b.programId?.priceRupee || 0) * 100) / 100).toFixed(2)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
