import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import API from "./api";
import LocationPickerWithSearch from "./components/LocationPickerWithSearch.jsx";
import { Button } from "./components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/Card";
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
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Program</CardTitle>
          <CardDescription>
            Add a new event or service you want to offer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {err && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              {err}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Program Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Wedding DJ Performance"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0d18] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30 focus:bg-white/5"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Music, Dance, Entertainment"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0d18] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30 focus:bg-white/5"
              />
            </div>

            {/* Price and Duration Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
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
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0f0d18] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30 focus:bg-white/5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duration (minutes) *
                </label>
                <input
                  name="durationMinutes"
                  type="number"
                  min="15"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  placeholder="120"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0f0d18] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30 focus:bg-white/5"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your program in detail..."
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0d18] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30 focus:bg-white/5 resize-none"
              />
            </div>

            {/* Venue Label */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Venue Name (Optional)
              </label>
              <input
                value={venue.label}
                onChange={(e) => setVenue((v) => ({ ...v, label: e.target.value }))}
                placeholder="e.g. Taj Convention Hall, Bangalore"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0d18] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30 focus:bg-white/5"
              />
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Venue Location (Click on map or search)
              </label>
              <LocationPickerWithSearch
                value={{ lat: venue.lat, lng: venue.lng }}
                onChange={({ lat, lng }) => setVenue((v) => ({ ...v, lat, lng }))}
                height={320}
                persistUserProfile={false}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center"
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
        </CardContent>
      </Card>
    </div>
  );
}
