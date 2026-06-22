import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { cn } from "../utils/cn"
import { toast } from "sonner"

export default function LocationPickerWithSearch({ value, onChange, height = 300, persistUserProfile = true }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [searchInput, setSearchInput] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(value || { lat: 12.9716, lng: 77.5946 })
  const markerRef = useRef(null)

  // Initialize map
  useEffect(() => {
    if (map.current) return

    const L = window.L
    if (!L) {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = initializeMap
      document.head.appendChild(script)
      const link = document.createElement("link")
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.rel = "stylesheet"
      document.head.appendChild(link)
    } else {
      initializeMap()
    }
  }, [])

  const initializeMap = () => {
    const L = window.L
    if (!L || !mapContainer.current) return

    map.current = L.map(mapContainer.current, {
      zoom: 13,
      center: [selectedLocation.lat, selectedLocation.lng],
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map.current)

    // Add marker
    markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
      draggable: true,
    }).addTo(map.current)

    markerRef.current.on("dragend", () => {
      const latLng = markerRef.current.getLatLng()
      setSelectedLocation({ lat: latLng.lat, lng: latLng.lng })
      onChange({ lat: latLng.lat, lng: latLng.lng })
    })

    map.current.on("click", (e) => {
      markerRef.current.setLatLng(e.latlng)
      setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    })
  }

  // Search for locations
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      toast.error("Failed to search locations")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle location selection from search results
  const selectLocation = (location) => {
    const lat = parseFloat(location.lat)
    const lng = parseFloat(location.lon)
    setSelectedLocation({ lat, lng })
    onChange({ lat, lng })

    if (map.current && markerRef.current) {
      map.current.setView([lat, lng], 13)
      markerRef.current.setLatLng([lat, lng])
    }

    setSearchInput(location.display_name)
    setSearchResults([])
    toast.success("Location selected")
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search for locations, cities, addresses..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            handleSearch(e.target.value)
          }}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0f0d18] border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/5"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full bg-[#0f0d18] border border-white/15 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto">
          {searchResults.map((result, idx) => (
            <button
              key={idx}
              onClick={() => selectLocation(result)}
              className="w-full px-4 py-2.5 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 transition"
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-[#c45c26] flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium line-clamp-1">
                    {result.display_name.split(",")[0]}
                  </p>
                  <p className="text-xs text-white/50 line-clamp-1">
                    {result.display_name.split(",").slice(1).join(",").trim()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#c45c26]" />
          <span className="text-xs text-white/50 ml-2">Searching...</span>
        </div>
      )}

      {/* Map */}
      <div
        ref={mapContainer}
        style={{ height: `${height}px` }}
        className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
      />

      {/* Selected Location Info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <p className="text-xs text-white/50 mb-1">Selected Location:</p>
        <p className="text-sm text-white/80 font-mono">
          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </p>
      </div>
    </div>
  )
}
