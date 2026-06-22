import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { downloadInvoicePDF } from "../utils/invoiceGenerator";

const STATUS_LABEL = {
  REQUESTED: "Requested",
  ACCEPTED: "Accepted — choose payment",
  PARTIALLY_PAID: "Partially paid — pay balance",
  PAID: "Paid in full",
  REJECTED: "Rejected",
  EXPIRED: "Payment window expired",
};

function badgeClass(status) {
  if (status === "PAID") return "badge badge-success";
  if (status === "PARTIALLY_PAID") return "badge badge-warning";
  if (status === "ACCEPTED") return "badge badge-warning";
  if (status === "REJECTED") return "badge badge-danger";
  if (status === "EXPIRED") return "badge badge-danger";
  return "badge badge-neutral";
}

function shortLocationLabel(label) {
  if (!label) return ""
  return String(label).split(",")[0].trim()
}

export default function UserBookings() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [payTarget, setPayTarget] = useState(null);

  const load = () =>
    API.get("/api/user/bookings").then((r) => setRows(r.data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  async function downloadInvoice(bookingId) {
    try {
      const { data } = await API.get(`/api/user/bookings/${bookingId}/invoice-data`);
      const c = data.company;
      const b = data.booking;
      const g = data.guest;
      await downloadInvoicePDF(
        {
          invoiceNumber: data.reference || bookingId,
          invoiceDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          artistName: b.artistName || "Artist",
          artistEmail: c.email || "",
          artistPhone: c.phone || "",
          artistGSTIN: c.gstin || "",
          userName: g?.name || "Guest",
          userEmail: g?.email || "",
          userPhone: g?.phone || "",
          eventDate: b.eventDate,
          eventLocation: b.eventLocationFull || b.eventLocation || "",
          programTitle: b.programTitle || "",
          programDescription: "",
          amount: (b.totalPaidPaise || 0) / 100,
          gstRate: 18,
          notes: "Generated after payment via Razorpay.",
        },
        `dhwani-invoice-${bookingId}.pdf`
      );
    } catch (e) {
      alert(e.response?.data?.message || "Could not build invoice");
    }
  }

  function openRazorpayCheckout(bookingId, checkout) {
    if (!window.Razorpay) {
      setMsg("Payment script still loading. Try again in a moment.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const options = {
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency || "INR",
      order_id: checkout.orderId,
      name: "Dhwani",
      description: "Event booking",
      handler: async function (response) {
        try {
          await API.post(`/api/user/bookings/${bookingId}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setMsg("Payment recorded. You can download your PDF invoice below.");
          setPayTarget(null);
          load();
        } catch (e) {
          setMsg(e.response?.data?.message || "Verification failed");
        }
      },
      prefill: { email: user.email || "", name: user.name || "" },
      theme: { color: "#1e2a5e" },
    };
    new window.Razorpay(options).open();
  }

  async function startCheckout(booking, mode) {
    setMsg("");
    try {
      const body =
        booking.status === "PARTIALLY_PAID" ? {} : { mode };
      const { data } = await API.post(
        `/api/user/bookings/${booking._id}/checkout`,
        body
      );
      openRazorpayCheckout(booking._id, data);
    } catch (e) {
      setMsg(e.response?.data?.message || "Could not start checkout");
    }
  }

  function pricePaise(b) {
    if (b.programPricePaise && b.programPricePaise > 0) return b.programPricePaise;
    return Math.round((b.programId?.priceRupee || 0) * 100);
  }

  return (
    <div>
      <div className="surface p-6 sm:p-8 mb-6">
        <h1 className="title-hero">My bookings</h1>
        <p className="muted mt-2 max-w-2xl">
          Clear flow: <strong>Request</strong> → artist <strong>accepts</strong> → you choose{" "}
          <strong>50%</strong> or <strong>full</strong> → download your invoice PDF.
        </p>
      </div>

      {msg && (
        <div className="rounded-2xl border border-[#1e2a5e]/10 bg-[#1e2a5e]/[0.03] p-4 text-sm text-[#1e2a5e] mb-5">
          {msg}
        </div>
      )}

      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-black/10">
            <h3 className="text-lg font-semibold text-[#1e2a5e]">Choose payment</h3>
            <p className="muted mt-2">
              Program: {payTarget.programId?.title} — total ₹
              {(pricePaise(payTarget) / 100).toFixed(2)}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                className="btn btn-primary w-full py-3"
                onClick={() => startCheckout(payTarget, "HALF")}
              >
                Pay 50% now (₹{(Math.floor(pricePaise(payTarget) / 2) / 100).toFixed(2)})
              </button>
              <button
                type="button"
                className="btn btn-ghost w-full py-3"
                onClick={() => startCheckout(payTarget, "FULL")}
              >
                Pay full amount (₹{(pricePaise(payTarget) / 100).toFixed(2)})
              </button>
              <button
                type="button"
                className="text-sm text-black/60 underline mt-2"
                onClick={() => setPayTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rows.map((b) => (
          <div
            key={b._id}
            className="card p-5"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#1e2a5e]">
                  {b.programId?.title || "Program"}
                  </p>
                  <span className={badgeClass(b.status)}>
                    {STATUS_LABEL[b.status] || b.status}
                  </span>
                </div>
                <p className="muted mt-1">
                  {b.artistId?.name} · {b.eventDate}
                </p>
                {b.eventLocation && (
                  <p className="mt-2 rounded-full border border-[#1e2a5e]/10 bg-[#1e2a5e]/[0.03] px-3 py-1 text-xs text-[#1e2a5e] inline-flex">
                    Location: {shortLocationLabel(b.eventLocation)}
                  </p>
                )}
                {(b.totalPaidPaise > 0 || b.status === "PARTIALLY_PAID" || b.status === "PAID") && (
                  <p className="text-xs text-emerald-900 mt-3">
                    Paid ₹{((b.totalPaidPaise || 0) / 100).toFixed(2)} of ₹
                    {(pricePaise(b) / 100).toFixed(2)}
                    {b.status === "PARTIALLY_PAID" && (
                      <span>
                        {" "}
                        · Balance ₹
                        {(
                          Math.max(0, pricePaise(b) - (b.totalPaidPaise || 0)) / 100
                        ).toFixed(2)}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end min-w-[220px]">
                {(b.status === "ACCEPTED" || b.status === "PARTIALLY_PAID") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (b.status === "ACCEPTED") setPayTarget(b);
                      else startCheckout(b);
                    }}
                    className="btn btn-accent w-full"
                  >
                    {b.status === "PARTIALLY_PAID" ? "Pay balance (Razorpay)" : "Pay with Razorpay"}
                  </button>
                )}
                {(b.totalPaidPaise || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => downloadInvoice(b._id)}
                    className="btn btn-ghost w-full text-xs"
                  >
                    Download PDF invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && (
        <div className="surface p-6 sm:p-8">
          <p className="muted">
          No bookings yet.{" "}
          <Link to="/u/artists" className="underline text-[#1e2a5e]">
            Browse artists
          </Link>
          .
          </p>
        </div>
      )}
    </div>
  );
}
