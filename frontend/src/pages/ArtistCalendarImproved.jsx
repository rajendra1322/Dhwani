import { useEffect, useState } from "react"
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react"
import API from "../api"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/Dialog"
import { toast } from "sonner"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from "date-fns"

const LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function ArtistCalendar() {
  const [weekly, setWeekly] = useState([])
  const [blocked, setBlocked] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      const [weeklyRes, blockedRes] = await Promise.all([
        API.get("/api/artist/weekly"),
        API.get("/api/artist/blocked"),
      ])
      setWeekly(weeklyRes.data)
      setBlocked(blockedRes.data)
    } catch (error) {
      toast.error("Failed to load calendar")
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function saveWeekly(days) {
    try {
      const { data } = await API.put("/api/artist/weekly", { days })
      setWeekly(data)
      toast.success("Weekly schedule updated")
    } catch (error) {
      toast.error("Failed to save schedule")
    }
  }

  function toggleDay(dayOfWeek) {
    const map = new Map(weekly.map((w) => [w.dayOfWeek, w.isOpen]))
    const cur = map.has(dayOfWeek) ? map.get(dayOfWeek) : true
    map.set(dayOfWeek, !cur)
    const days = Array.from({ length: 7 }, (_, d) => ({
      dayOfWeek: d,
      isOpen: map.has(d) ? map.get(d) : true,
    }))
    saveWeekly(days)
  }

  async function addBlock(date) {
    setLoading(true)
    try {
      await API.post("/api/artist/blocked", { date: format(date, "yyyy-MM-dd") })
      toast.success("Date blocked successfully")
      await load()
      setSelectedDate(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block date")
    } finally {
      setLoading(false)
    }
  }

  async function removeBlock(id) {
    try {
      await API.delete(`/api/artist/blocked/${id}`)
      toast.success("Block removed")
      await load()
    } catch (error) {
      toast.error("Failed to remove block")
    }
  }

  const isDateBlocked = (date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return blocked.some((b) => b.date === dateStr)
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const days = getDaysInMonth()
  const firstDay = days[0]
  const startingDayOfWeek = firstDay.getDay()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
          <CardDescription>
            Manage your weekly schedule and block out unavailable dates
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
              <CardDescription className="text-xs">
                Your regular availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {LABELS.map((label, dayOfWeek) => {
                  const row = weekly.find((w) => w.dayOfWeek === dayOfWeek)
                  const isOpen = row ? row.isOpen : true

                  return (
                    <button
                      key={label}
                      onClick={() => toggleDay(dayOfWeek)}
                      className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-all ${
                        isOpen
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                          : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="font-semibold">{label}</div>
                      <div className="text-[10px] mt-1 opacity-75">
                        {isOpen ? "Available" : "Closed"}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar and Blocked Dates */}
        <div className="lg:col-span-2 space-y-4">
          {/* Calendar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {format(currentMonth, "MMMM yyyy")}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                      )
                    }
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                      )
                    }
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {LABELS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-white/50 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array(startingDayOfWeek)
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                  {/* Days */}
                  {days.map((day) => {
                    const blocked = isDateBlocked(day)
                    const isCurrentDay = isToday(day)
                    const isPastDate = day < new Date() && !isToday(day)

                    return (
                      <Dialog key={day.toISOString()}>
                        <DialogTrigger asChild>
                          <button
                            disabled={isPastDate}
                            onClick={() => setSelectedDate(day)}
                            className={`aspect-square rounded-lg border text-sm font-medium transition-all flex items-center justify-center ${
                              blocked
                                ? "bg-red-500/20 border-red-500/40 text-red-200 hover:bg-red-500/30"
                                : isCurrentDay
                                ? "bg-[#c45c26]/20 border-[#c45c26]/40 text-white hover:bg-[#c45c26]/30"
                                : "bg-white/5 border-white/15 text-white/80 hover:bg-white/10"
                            } ${isPastDate ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            {day.getDate()}
                          </button>
                        </DialogTrigger>
                        {!isPastDate && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {format(day, "EEEE, MMMM d, yyyy")}
                              </DialogTitle>
                              <DialogDescription>
                                {blocked
                                  ? "This date is currently blocked. Remove the block?"
                                  : "Block this date to prevent bookings?"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-3 py-4">
                              <Button variant="outline" className="flex-1">
                                Cancel
                              </Button>
                              {blocked ? (
                                <Button
                                  onClick={() => {
                                    const blockId = blocked.find(
                                      (b) =>
                                        b.date === format(day, "yyyy-MM-dd")
                                    )?._id
                                    if (blockId) removeBlock(blockId)
                                  }}
                                  variant="default"
                                  className="flex-1"
                                >
                                  Remove Block
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => addBlock(day)}
                                  disabled={loading}
                                  className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                  Block Date
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blocked Dates List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Blocked Dates</CardTitle>
            </CardHeader>
            <CardContent>
              {blocked.length > 0 ? (
                <div className="space-y-2">
                  {blocked.map((block) => (
                    <div
                      key={block._id}
                      className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {new Date(block.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlock(block._id)}
                        className="text-red-200 hover:text-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-white/60">No blocked dates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
