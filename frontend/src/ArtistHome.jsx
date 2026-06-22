import { useNavigate } from "react-router-dom";

export default function ArtistHome() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-serif text-[#f4e9d8] mb-2">Welcome back</h1>
      <p className="text-white/60 max-w-xl">
        Shape your calendar, publish programs, and respond to booking requests. Payments
        run in Razorpay test mode until you go live.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        <Card
          title="Programs"
          body="Create performances, workshops, or packages with clear pricing."
          onClick={() => navigate("/a/programs")}
        />
        <Card
          title="Calendar"
          body="Set weekly open days and block travel or rest days."
          onClick={() => navigate("/a/calendar")}
        />
        <Card
          title="Bookings"
          body="Accept or reject requests before the guest pays."
          onClick={() => navigate("/a/bookings")}
        />
      </div>
    </div>
  );
}

function Card({ title, body, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-[#c45c26]/50 hover:bg-white/[0.07] transition"
    >
      <h2 className="text-lg font-semibold text-[#f4e9d8]">{title}</h2>
      <p className="text-sm text-white/55 mt-2">{body}</p>
    </button>
  );
}
