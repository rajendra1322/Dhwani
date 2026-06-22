import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Trash2, MapPin, Clock, IndianRupee } from "lucide-react"
import API from "../api"
import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { toast } from "sonner"

export default function ArtistPrograms() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await API.get("/api/artist/programs")
      setPrograms(response.data)
    } catch (error) {
      toast.error("Failed to load programs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function remove(id, title) {
    if (!window.confirm(`Delete "${title}" program?`)) return
    try {
      await API.delete(`/api/artist/programs/${id}`)
      toast.success("Program deleted")
      load()
    } catch (error) {
      toast.error("Failed to delete program")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Your Programs</CardTitle>
              <CardDescription>
                Manage your event programs and services
              </CardDescription>
            </div>
            <Link to="/a/programs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Programs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Card
              key={program._id}
              className="group hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-[#f4e9d8] transition">
                  {program.title}
                </CardTitle>
                {program.category && (
                  <CardDescription className="capitalize">
                    {program.category}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* Price */}
                <div className="flex items-center gap-2 text-white/70">
                  <IndianRupee className="h-4 w-4 text-[#c45c26]" />
                  <span className="font-semibold text-white">₹{program.priceRupee}</span>
                  <span className="text-xs text-white/50">per session</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-white/70">
                  <Clock className="h-4 w-4 text-[#c45c26]" />
                  <span className="text-sm">{program.durationMinutes} minutes</span>
                </div>

                {/* Location */}
                {program.venue?.label && (
                  <div className="flex items-start gap-2 text-white/70">
                    <MapPin className="h-4 w-4 text-[#c45c26] mt-0.5 flex-shrink-0" />
                    <span className="text-sm line-clamp-2">{program.venue.label}</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="pt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      program.isActive
                        ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                    }`}
                  >
                    {program.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              </CardContent>

              {/* Delete Button */}
              <div className="px-6 pb-6 pt-0">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(program._id, program.title)}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="space-y-3">
              <p className="text-white/60">No programs yet</p>
              <p className="text-sm text-white/40">
                Create your first program to get started
              </p>
              <Link to="/a/programs/new">
                <Button className="mt-4">Create Your First Program</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
