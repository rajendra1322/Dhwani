import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock3, Sparkles, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import API from "../api";
import { Button } from "../components/ui/Button";
import { BentoCard, BentoGrid, BentoMetric, BentoShell } from "../components/artist/Bento";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { toast } from "sonner";

const LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ArtistCalendar() {
  const [weekly, setWeekly] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [weeklyRes, blockedRes] = await Promise.all([
        API.get("/api/artist/weekly"),
        API.get("/api/artist/blocked"),
      ]);
      setWeekly(weeklyRes.data);
      setBlocked(blockedRes.data);
    } catch {
      toast.error("Failed to load calendar");
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function saveWeekly(days) {
    try {
      const { data } = await API.put("/api/artist/weekly", { days });
      setWeekly(data);
      toast.success("Weekly schedule updated");
    } catch {
      toast.error("Failed to save schedule");
    }
  }

  function toggleDay(dayOfWeek) {
    const map = new Map(weekly.map((w) => [w.dayOfWeek, w.isOpen]));
    const cur = map.has(dayOfWeek) ? map.get(dayOfWeek) : true;
    map.set(dayOfWeek, !cur);
    const days = Array.from({ length: 7 }, (_, d) => ({
      dayOfWeek: d,
      isOpen: map.has(d) ? map.get(d) : true,
    }));
    saveWeekly(days);
  }

  async function addBlock(date) {
    setLoading(true);
    try {
      await API.post("/api/artist/blocked", { date: format(date, "yyyy-MM-dd") });
      toast.success("Date blocked successfully");
      await load();
    } catch {
      toast.error("Failed to block date");
    } finally {
      setLoading(false);
    }
  }

  async function removeBlock(id) {
    try {
      await API.delete(`/api/artist/blocked/${id}`);
      toast.success("Block removed");
      await load();
    } catch {
      toast.error("Failed to remove block");
    }
  }

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDay = days[0];
  const startingDayOfWeek = firstDay.getDay();
  const openDays = weekly.filter((w) => w.isOpen).length;

  const isDateBlocked = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blocked.some((b) => b.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <BentoShell
        eyebrow="Calendar"
        title="Availability "
        description="Keep your weekly hours clear, block out travel or rest days."
      >
        <BentoGrid className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-3">
          <BentoMetric
            label="Open days"
            value={`${openDays}/7`}
            hint="Weekly availability"
            accent="bg-[#c45c26]"
          />
          <BentoMetric
            label="Blocked"
            value={`${blocked.length}`}
            hint="Dates currently hidden"
            accent="bg-[#1e2a5e]"
          />
          <BentoMetric
            label="Mode"
            value="Open"
            hint="My avaibility is visible to clients"
            accent="bg-emerald-500"
          />
        </BentoGrid>
      </BentoShell>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <BentoCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Weekly schedule</p>
                <h2 className="mt-2 text-2xl font-serif text-[#1e2a5e]">Open days</h2>
              </div>
            <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-[#6b5b49]">
                Tap to toggle
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LABELS.map((label, dayOfWeek) => {
                const row = weekly.find((w) => w.dayOfWeek === dayOfWeek);
                const isOpen = row ? row.isOpen : true;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDay(dayOfWeek)}
                    className={`group rounded-2xl border p-4 text-left transition ${
                      isOpen
                        ? "border-emerald-500/25 bg-emerald-50 text-emerald-900"
                        : "border-black/10 bg-white text-[#5c4f3d]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{label}</span>
                      <Clock3 className="h-4 w-4 opacity-70" />
                    </div>
                    <p className="mt-6 text-xs uppercase tracking-[0.2em] opacity-70">
                      {isOpen ? "Open" : "Closed"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </BentoCard>

        <div className="space-y-4">
          <BentoCard className="overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Month view</p>
                <h2 className="mt-2 text-2xl font-serif text-[#1e2a5e]">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
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
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                    )
                  }
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
                <div className="grid grid-cols-7 gap-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#6b5b49]">
                {LABELS.map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array(startingDayOfWeek)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-[#f4efe8]" />
                  ))}

                {days.map((day) => {
                  const blockedDay = isDateBlocked(day);
                  const isCurrentDay = isToday(day);
                  const isPastDate = day < new Date() && !isToday(day);

                  return (
                    <Dialog key={day.toISOString()}>
                      <DialogTrigger asChild>
                        <button
                          disabled={isPastDate}
                          className={`aspect-square rounded-2xl border text-sm font-medium transition-all flex items-center justify-center ${
                            blockedDay
                              ? "border-red-500/25 bg-red-50 text-red-900"
                              : isCurrentDay
                              ? "border-[#c45c26]/25 bg-[#fff3ea] text-[#c45c26]"
                              : "border-black/10 bg-white text-[#1c1b1a] hover:bg-[#1e2a5e]/5"
                          } ${isPastDate ? "cursor-not-allowed opacity-30" : "cursor-pointer"}`}
                        >
                          {day.getDate()}
                        </button>
                      </DialogTrigger>
                      {!isPastDate && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{format(day, "EEEE, MMMM d, yyyy")}</DialogTitle>
                            <DialogDescription>
                              {blockedDay
                                ? "This date is currently blocked. Remove the block?"
                                : "Block this date to prevent bookings?"}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-3 py-4">
                            <Button variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            {blockedDay ? (
                              <Button
                                onClick={() => {
                                  const blockId = blocked.find(
                                    (b) => b.date === format(day, "yyyy-MM-dd")
                                  )?._id;
                                  if (blockId) removeBlock(blockId);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                              >
                                Remove Block
                              </Button>
                            ) : (
                              <Button
                                onClick={() => addBlock(day)}
                                disabled={loading}
                                className="flex-1"
                              >
                                Block Date
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  );
                })}
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Blocked dates</p>
                <h2 className="mt-2 text-2xl font-serif text-[#1e2a5e]">Time away</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-[#c45c26]" />
            </div>

            <div className="mt-5 space-y-3">
              {blocked.length > 0 ? (
                blocked.map((block) => (
                  <div
                    key={block._id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/15 bg-red-50 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-[#1c1b1a]">
                      {new Date(block.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlock(block._id)}
                      className="text-red-700 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-black/10 bg-white p-6 text-center text-sm text-[#5c4f3d]">
                  No blocked dates yet
                </div>
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
