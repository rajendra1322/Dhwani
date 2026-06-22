import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Download,
  CreditCard,
  AlertCircle,
  User,
} from "lucide-react"
import API from "../api"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog"
import { toast } from "sonner"
import { downloadInvoicePDF } from "../utils/invoiceGenerator"

const STATUS_CONFIG = {
  REQUESTED: {
    label: "Pending Artist Response",
    icon: Clock,
    color: "yellow",
    description: "Waiting for artist to accept",
  },
  ACCEPTED: {
    label: "Ready for Payment",
    icon: DollarSign,
    color: "blue",
    description: "Choose 50% or 100% payment",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    icon: CreditCard,
    color: "amber",
    description: "Pay remaining balance",
  },
  PAID: {
    label: "Payment Complete",
    icon: CheckCircle,
    color: "green",
    description: "All set for your event",
  },
  REJECTED: {
    label: "Rejected",
    icon: AlertCircle,
    color: "red",
    description: "Artist declined your booking",
  },
  EXPIRED: {
    label: "Expired",
    icon: AlertCircle,
    color: "red",
    description: "Payment window expired",
  },
}

export default function UserBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [paymentMode, setPaymentMode] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await API.get("/api/user/bookings")
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

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.REQUESTED
  }

  const calculateAmount = (booking) => {
    if (booking.programPricePaise && booking.programPricePaise > 0) {
      return booking.programPricePaise
    }
    return Math.round((booking.programId?.priceRupee || 0) * 100)
  }

  async function downloadInvoice(bookingId) {
    try {
      const { data } = await API.get(`/api/user/bookings/${bookingId}/invoice-data`)
      const b = data.booking
      const g = data.guest
      const c = data.company

      const invoiceData = {
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
        eventLocation: b.eventLocation || "",
        programTitle: b.programTitle || "",
        programDescription: "",
        amount: (b.totalPaidPaise || 0) / 100,
        gstRate: 18,
        notes: "Thank you for booking with Dhwani!",
      }

      const filename = `dhwani-invoice-${bookingId}.pdf`
      const success = await downloadInvoicePDF(invoiceData, filename)
      if (success) {
        toast.success("Invoice downloaded successfully")
      } else {
        toast.error("Failed to download invoice")
      }
    } catch (error) {
      toast.error("Could not generate invoice")
    }
  }

  function openRazorpayCheckout(bookingId, checkout) {
    if (!window.Razorpay) {
      toast.error("Payment script still loading. Try again in a moment.")
      return
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const options = {
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency || "INR",
      order_id: checkout.orderId,
      name: "Dhwani",
      description: "Event booking payment",
      handler: async function (response) {
        try {
          setIsProcessing(true)
          await API.post(`/api/user/bookings/${bookingId}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          toast.success("Payment recorded successfully!")
          setSelectedBooking(null)
          setPaymentMode(null)
          await load()
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment verification failed")
        } finally {
          setIsProcessing(false)
        }
      },
      prefill: { email: user.email || "", name: user.name || "" },
      theme: { color: "#c45c26" },
    }
    new window.Razorpay(options).open()
  }

  async function startCheckout(booking, mode) {
    try {
      setIsProcessing(true)
      const body =
        booking.status === "PARTIALLY_PAID" ? {} : { mode }
      const { data } = await API.post(
        `/api/user/bookings/${booking._id}/checkout`,
        body
      )
      openRazorpayCheckout(booking._id, data)
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start checkout")
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateAmountForMode = (booking, mode) => {
    const total = calculateAmount(booking)
    return mode === "HALF" ? Math.floor(total / 2) : total
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>
            Manage your event bookings and payments
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
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status)
            const StatusIcon = statusConfig.icon
            const totalAmount = calculateAmount(booking)
            const paidAmount = booking.totalPaidPaise || 0
            const remainingAmount = totalAmount - paidAmount

            return (
              <Card
                key={booking._id}
                className="hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header with Status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {booking.programId?.title || "Program"}
                        </h3>
                        <p className="text-sm text-white/60">
                          with {booking.artistId?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                        <StatusIcon className="h-4 w-4 text-[#c45c26]" />
                        <span className="text-xs font-medium text-white">
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <MapPin className="h-4 w-4 text-[#c45c26] flex-shrink-0" />
                          <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                        </div>
                        {booking.eventLocation && (
                          <div className="flex items-start gap-2 text-white/80">
                            <User className="h-4 w-4 text-[#c45c26] flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{booking.eventLocation}</span>
                          </div>
                        )}
                      </div>

                      {/* Payment Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Program Fee:</span>
                          <span className="font-semibold text-[#c45c26]">
                            ₹{(totalAmount / 100).toFixed(2)}
                          </span>
                        </div>
                        {paidAmount > 0 && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">Paid:</span>
                              <span className="text-emerald-400">
                                ₹{(paidAmount / 100).toFixed(2)}
                              </span>
                            </div>
                            {remainingAmount > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-white/60">Remaining:</span>
                                <span className="text-amber-400">
                                  ₹{(remainingAmount / 100).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        {/* Progress Bar */}
                        {paidAmount > 0 && remainingAmount > 0 && (
                          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{
                                width: `${(paidAmount / totalAmount) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      {(booking.status === "ACCEPTED" || booking.status === "PARTIALLY_PAID") && (
                        <Dialog open={selectedBooking?._id === booking._id} onOpenChange={(open) => {
                          if (!open) setSelectedBooking(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedBooking(booking)}
                              className="flex-1 flex items-center justify-center"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              {booking.status === "PARTIALLY_PAID" ? "Pay Balance" : "Proceed to Payment"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {booking.status === "PARTIALLY_PAID"
                                  ? "Pay Remaining Amount"
                                  : "Select Payment Option"}
                              </DialogTitle>
                              <DialogDescription>
                                {booking.programId?.title} - ₹{(totalAmount / 100).toFixed(2)}
                              </DialogDescription>
                            </DialogHeader>

                            {booking.status === "ACCEPTED" ? (
                              <div className="space-y-4 py-4">
                                <p className="text-sm text-white/70">
                                  Choose how much you want to pay now:
                                </p>

                                <Button
                                  onClick={() => {
                                    setPaymentMode("HALF")
                                    startCheckout(booking, "HALF")
                                  }}
                                  disabled={isProcessing}
                                  variant="default"
                                  className="w-full h-12"
                                >
                                  <div className="text-center w-full">
                                    <div className="text-xs text-white/80">Pay 50% Now</div>
                                    <div className="font-semibold">
                                      ₹{(calculateAmountForMode(booking, "HALF") / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </Button>

                                <Button
                                  onClick={() => {
                                    setPaymentMode("FULL")
                                    startCheckout(booking, "FULL")
                                  }}
                                  disabled={isProcessing}
                                  variant="outline"
                                  className="w-full h-12"
                                >
                                  <div className="text-center w-full">
                                    <div className="text-xs">Pay Full Amount</div>
                                    <div className="font-semibold">
                                      ₹{(calculateAmountForMode(booking, "FULL") / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4 py-4">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                  <p className="text-sm text-amber-200">
                                    Pay remaining balance
                                  </p>
                                </div>

                                <Button
                                  onClick={() => startCheckout(booking)}
                                  disabled={isProcessing}
                                  variant="default"
                                  className="w-full h-12"
                                >
                                  <div className="text-center w-full">
                                    <div className="text-xs text-white/80">Complete Payment</div>
                                    <div className="font-semibold">
                                      ₹{(remainingAmount / 100).toFixed(2)}
                                    </div>
                                  </div>
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}

                      {paidAmount > 0 && (
                        <Button
                          onClick={() => downloadInvoice(booking._id)}
                          variant="outline"
                          className="flex-1 flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                      )}

                      {booking.status === "REJECTED" && (
                        <div className="w-full text-center">
                          <p className="text-sm text-red-400">
                            Artist declined your booking request
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="space-y-3">
              <p className="text-white/60">No bookings yet</p>
              <p className="text-sm text-white/40">
                Find and book your favorite artists to get started
              </p>
              <Link to="/u/artists">
                <Button className="mt-4">Browse Artists</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
