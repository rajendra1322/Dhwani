import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, IndianRupee, MapPin, Plus, Sparkles, Trash2 } from "lucide-react";
import API from "../api";
import { Button } from "../components/ui/Button";
import { BentoCard, BentoGrid, BentoMetric, BentoShell } from "../components/artist/Bento";
import { toast } from "sonner";

export default function ArtistPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/artist/programs");
      setPrograms(response.data);
    } catch {
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function remove(id, title) {
    if (!window.confirm(`Delete "${title}" program?`)) return;
    try {
      await API.delete(`/api/artist/programs/${id}`);
      toast.success("Program deleted");
      load();
    } catch {
      toast.error("Failed to delete program");
    }
  }

  return (
    <div className="space-y-6">
      <BentoShell
        eyebrow="Programs"
        title="Your Programs"
        description="Build a list of services with clear pricing, duration, and venue details."
        actions={
          <Link to="/a/programs/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Program
            </Button>
          </Link>
        }
      >
        {/* <BentoGrid className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-3">
          <BentoMetric label="Total" value={`${programs.length}`} hint="Active and hidden programs" accent="bg-[#c45c26]" />
          <BentoMetric label="Flow" value="Fast edits" hint="Responsive cards and clean spacing" accent="bg-[#1e2a5e]" />
          <BentoMetric label="Tone" value="Premium" hint="Designed for high-trust bookings" accent="bg-emerald-500" />
        </BentoGrid> */}
      </BentoShell>

      {loading ? (
        <BentoGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <BentoCard key={i} className="animate-pulse">
              <div className="space-y-4">
                <div className="h-6 w-3/4 rounded-full bg-white/10" />
                <div className="h-4 w-1/2 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-4/5 rounded-full bg-white/10" />
                  <div className="h-3 w-3/5 rounded-full bg-white/10" />
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      ) : programs.length > 0 ? (
        <BentoGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => (
            <BentoCard
              key={program._id}
              className="group bg-gradient-to-br from-white via-[#fffaf6] to-[#f8fbff]"
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#c45c26]/20 bg-[#fff3ea] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#c45c26]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Program
                      </div>
                      <h2 className="text-2xl font-serif text-[#1e2a5e]">{program.title}</h2>
                      {program.category && (
                        <p className="text-sm capitalize text-[#5c4f3d]">{program.category}</p>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl border px-3 py-2 text-xs font-medium ${
                        program.isActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-800"
                      }`}
                    >
                      {program.isActive ? "Active" : "Hidden"}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="flex items-center gap-2 text-[#6b5b49]">
                        <IndianRupee className="h-4 w-4 text-[#c45c26]" />
                        <span className="text-xs uppercase tracking-[0.2em]">Price</span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-[#1e2a5e]">
                        ₹{program.priceRupee}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="flex items-center gap-2 text-[#6b5b49]">
                        <Clock3 className="h-4 w-4 text-[#c45c26]" />
                        <span className="text-xs uppercase tracking-[0.2em]">Duration</span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-[#1e2a5e]">
                        {program.durationMinutes} min
                      </p>
                    </div>
                  </div>

                  {program.venue?.label && (
                    <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4 text-sm text-[#5c4f3d]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c45c26]" />
                      <span>{program.venue.label}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => remove(program._id, program.title)}
                    className="flex-1 gap-2 bg-red-500/15 text-red-800 hover:bg-red-500/25"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      ) : (
        <BentoCard className="bg-gradient-to-br from-white/[0.05] to-[#1e2a5e]/20">
          <div className="flex flex-col items-start gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Empty state</p>
              <h2 className="text-2xl font-serif text-[#1e2a5e]">No programs yet</h2>
              <p className="max-w-xl text-sm text-[#5c4f3d]">
                Start with one strong offering so visitors understand your value quickly.
              </p>
            </div>
            <Link to="/a/programs/new">
              <Button className="gap-2">
                Create your first program
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </BentoCard>
      )}
    </div>
  );
}
