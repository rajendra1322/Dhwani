import { useEffect, useState } from "react";
import { Calendar, CheckCircle, ChevronRight, Mail, MapPin, Phone, User, XCircle } from "lucide-react";
import API from "../api";
import { Button } from "../components/ui/Button";
import { BentoCard, BentoGrid, BentoMetric, BentoShell } from "../components/artist/Bento";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { toast } from "sonner";

function shortLocationLabel(label) {
  if (!label) return ""
  return String(label).split(",")[0].trim()
}

export default function ArtistBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/artist/bookings");
      setBookings(response.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id, action) {
    try {
      await API.patch(`/api/artist/bookings/${id}`, {
        action,
        rejectNote: action === "reject" ? rejectNote : undefined,
      });
      toast.success(action === "accept" ? "Booking accepted" : "Booking rejected");
      setRejectNote("");
      load();
    } catch {
      toast.error("Action failed");
    }
  }

  const requestedCount = bookings.filter((b) => b.status === "REQUESTED").length;
  const activeCount = bookings.filter((b) => b.status === "ACCEPTED").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "REQUESTED":
        return (
          <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-800">
            Pending review
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return <span className="text-xs text-white/60">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <BentoShell
        eyebrow="Bookings"
        title="A booking inbox"
        description="Review requests  and accept it to confirm the booking. Users will pay after acceptance, and you can keep track of payment status from the same place."
      >
        <BentoGrid className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-3">
          <BentoMetric label="Inbox" value={`${bookings.length}`} hint="Total requests" accent="bg-[#c45c26]" />
          <BentoMetric label="Pending" value={`${requestedCount}`} hint="Need attention" accent="bg-yellow-500" />
          <BentoMetric label="Accepted" value={`${activeCount}`} hint="Confirmed jobs" accent="bg-emerald-500" />
        </BentoGrid>
      </BentoShell>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <BentoCard key={i} className="animate-pulse">
              <div className="space-y-3">
                <div className="h-5 w-1/3 rounded-full bg-white/10" />
                <div className="h-4 w-1/4 rounded-full bg-white/10" />
                <div className="h-4 w-1/2 rounded-full bg-white/10" />
              </div>
            </BentoCard>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BentoCard key={booking._id} className="bg-gradient-to-br from-white via-[#fffaf6] to-[#f8fbff]">
              <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#6b5b49]">Booking request</p>
                    <h3 className="text-2xl font-serif text-[#1e2a5e]">
                      {booking.programId?.title}
                    </h3>
                    <p className="text-sm text-[#5c4f3d]">
                      Requested by {booking.userId?.name}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6b5b49]">User information</p>
                    <div className="mt-4 space-y-3 text-sm text-[#1c1b1a]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#c45c26]" />
                        <span>{booking.userId?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#c45c26]" />
                        <span className="break-all">{booking.userId?.email}</span>
                      </div>
                      {booking.userId?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#c45c26]" />
                          <span>{booking.userId?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6b5b49]">Event details</p>
                    <div className="mt-4 space-y-3 text-sm text-[#1c1b1a]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#c45c26]" />
                        <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                      </div>
                      {booking.eventLocation && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-[#c45c26]" />
                          <div>
                            <p className="font-medium text-[#1e2a5e]">Event location</p>
                            <p className="text-[#5c4f3d]">{shortLocationLabel(booking.eventLocation)}</p>
                            <p className="line-clamp-2 text-xs text-[#8b7d6d]">{booking.eventLocation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6b5b49]">Program fee</p>
                    <p className="mt-1 text-2xl font-semibold text-[#1e2a5e]">
                      ₹{booking.programId?.priceRupee}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#5c4f3d]">
                    <ChevronRight className="h-4 w-4" />
                    Quick action card
                  </div>
                </div>

                {booking.status === "REQUESTED" && (
                  <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                    <Button onClick={() => handleAction(booking._id, "accept")} className="flex-1 gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 gap-2">
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject booking</DialogTitle>
                          <DialogDescription>
                            Add a note if you want to give the guest context.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <textarea
                            placeholder="Optional reason..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            className="min-h-32 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] focus:outline-none focus:border-[#1e2a5e]/30 focus:ring-2 focus:ring-[#1e2a5e]/10"
                            rows={4}
                          />
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleAction(booking._id, "reject")}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                              Confirm rejection
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </BentoCard>
          ))}
        </div>
      ) : (
        <BentoCard className="bg-gradient-to-br from-white/[0.05] to-[#1e2a5e]/20">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Empty inbox</p>
            <h2 className="text-2xl font-serif text-[#1e2a5e]">No booking requests yet</h2>
            <p className="text-sm text-[#5c4f3d]">
              When users book your programs, they’ll appear here with a smoother review flow.
            </p>
          </div>
        </BentoCard>
      )}
    </div>
  );
}
