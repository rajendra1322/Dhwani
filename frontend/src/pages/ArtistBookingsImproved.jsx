import { useEffect, useState } from "react"
import { CheckCircle, XCircle, MapPin, Calendar, User, Phone, Mail } from "lucide-react"
import API from "../api"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/Dialog"
import { toast } from "sonner"

export default function ArtistBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const response = await API.get("/api/artist/bookings")
      setBookings(response.data)
    } catch (error) {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAction(id, action) {
    try {
      await API.patch(`/api/artist/bookings/${id}`, {
        action,
        rejectNote: action === "reject" ? rejectNote : undefined,
      })
      toast.success(action === "accept" ? "Booking accepted" : "Booking rejected")
      setRejectNote("")
      setSelectedBooking(null)
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "REQUESTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-200 border border-yellow-500/30">
            Pending Review
          </span>
        )
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </span>
        )
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-200 border border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        )
      default:
        return <span className="text-xs text-white/60">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
          <CardDescription>
            Manage and respond to event booking requests from users
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-5 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card
              key={booking._id}
              className="hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {booking.programId?.title}
                      </h3>
                      <p className="text-sm text-white/60">
                        Booking from {booking.userId?.name}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    {/* User Info */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Guest Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <User className="h-4 w-4 text-[#c45c26] flex-shrink-0" />
                          <span>{booking.userId?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <Mail className="h-4 w-4 text-[#c45c26] flex-shrink-0" />
                          <span className="break-all">{booking.userId?.email}</span>
                        </div>
                        {booking.userId?.phone && (
                          <div className="flex items-center gap-2 text-white/80">
                            <Phone className="h-4 w-4 text-[#c45c26] flex-shrink-0" />
                            <span>{booking.userId?.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Event Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <Calendar className="h-4 w-4 text-[#c45c26] flex-shrink-0" />
                          <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                        </div>
                        {booking.eventLocation && (
                          <div className="flex items-start gap-2 text-white/80">
                            <MapPin className="h-4 w-4 text-[#c45c26] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium mb-1">Event Location:</p>
                              <p className="text-white/60 line-clamp-2">
                                {booking.eventLocation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Program Price */}
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-sm text-white/60 mb-1">Program Fee:</p>
                    <p className="text-xl font-semibold text-[#c45c26]">
                      ₹{booking.programId?.priceRupee}
                    </p>
                  </div>

                  {/* Actions */}
                  {booking.status === "REQUESTED" && (
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <Button
                        onClick={() => handleAction(booking._id, "accept")}
                        variant="default"
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Booking</DialogTitle>
                            <DialogDescription>
                              Provide an optional reason for rejecting this booking
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <textarea
                              placeholder="Optional: Reason for rejection..."
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#0f0d18] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30"
                              rows={4}
                            />
                            <div className="flex gap-3">
                              <Button variant="outline" className="flex-1">
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleAction(booking._id, "reject")}
                                variant="default"
                                className="flex-1 bg-red-600 hover:bg-red-700"
                              >
                                Confirm Rejection
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="space-y-3">
              <p className="text-white/60">No booking requests</p>
              <p className="text-sm text-white/40">
                When users book your programs, they'll appear here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
