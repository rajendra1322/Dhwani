import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import API from "./api";
import LocationPickerWithSearch from "./components/LocationPickerWithSearch.jsx";
import { BentoCard, BentoGrid, BentoMetric, BentoShell } from "./components/artist/Bento";
import { Button } from "./components/ui/Button";
import { toast } from "sonner";

export default function AddProgram() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "",
    priceRupee: "",
    durationMinutes: "120",
    description: "",
  });
  const [venue, setVenue] = useState({ lat: 12.9716, lng: 77.5946, label: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await API.post("/api/artist/programs", {
        title: form.title,
        category: form.category,
        description: form.description,
        priceRupee: Number(form.priceRupee),
        durationMinutes: Number(form.durationMinutes) || 120,
        venue: {
          lat: venue.lat,
          lng: venue.lng,
          label: venue.label || "",
        },
      });
      toast.success("Program created successfully!");
      navigate("/a/programs");
    } catch (ex) {
      const errorMessage = ex.response?.data?.message || "Could not save program";
      setErr(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <BentoShell
        eyebrow="Create program"
        title="Shape your offers"
        description="Package your service with the details clients need to trust the booking."
      >
        {/* <BentoGrid className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-3">
          <BentoMetric label="Title" value="Clear" hint="Show what you offer" accent="bg-[#c45c26]" />
          <BentoMetric label="Pricing" value="Upfront" hint="Make value obvious" accent="bg-[#1e2a5e]" />
          <BentoMetric label="Venue" value="Mapped" hint="Location-aware booking" accent="bg-emerald-500" />
        </BentoGrid> */}
      </BentoShell>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <BentoCard>
          {err && (
            <div className="mb-6 rounded-2xl border border-red-500/15 bg-red-50 p-4 text-sm text-red-800">
              {err}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1e2a5e]">
                Program Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Wedding DJ Performance"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] focus:border-[#1e2a5e]/30 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]/10"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1e2a5e]">
                Category
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Music, Dance, Entertainment"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] focus:border-[#1e2a5e]/30 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]/10"
              />
            </div>

            {/* Price and Duration Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1e2a5e]">
                  Price (₹) *
                </label>
                <input
                  name="priceRupee"
                  type="number"
                  min="0"
                  required
                  value={form.priceRupee}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] focus:border-[#1e2a5e]/30 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1e2a5e]">
                  Duration (minutes) *
                </label>
                <input
                  name="durationMinutes"
                  type="number"
                  min="15"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  placeholder="120"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] focus:border-[#1e2a5e]/30 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]/10"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1e2a5e]">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your program in detail..."
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] focus:border-[#1e2a5e]/30 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]/10"
              />
            </div>

            {/* Venue Label */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1e2a5e]">
                Venue Name (Optional)
              </label>
              <input
                value={venue.label}
                onChange={(e) => setVenue((v) => ({ ...v, label: e.target.value }))}
                placeholder="e.g. Taj Convention Hall, Bangalore"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] focus:border-[#1e2a5e]/30 focus:outline-none focus:ring-2 focus:ring-[#1e2a5e]/10"
              />
            </div>

            {/* Location Picker */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1e2a5e]">
                Venue Location (Click on map or search)
              </label>
              <LocationPickerWithSearch
                value={{ lat: venue.lat, lng: venue.lng }}
                onChange={(next) => setVenue((v) => ({ ...v, ...next }))}
                height={320}
                persistUserProfile={false}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 items-center justify-center"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? "Creating..." : "Create Program"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/a/programs")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </BentoCard>

        {/* <div className="space-y-4">
          <BentoCard className="bg-gradient-to-br from-white/[0.05] to-[#1e2a5e]/20">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Tips</p>
              <h2 className="text-2xl font-serif text-[#1e2a5e]">What makes a great listing</h2>
              <p className="text-sm leading-6 text-[#5c4f3d]">
                Use a clear title, add a concise category, and keep the venue label human-readable
                so the card feels premium and trustworthy.
              </p>
            </div>
          </BentoCard>

          <BentoCard>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Preview</p>
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <p className="text-sm text-[#5c4f3d]">Your program will appear as a clean card in the Programs page.</p>
              </div>
            </div>
          </BentoCard>
        </div> */}
      </div>
    </div>
  );
}
