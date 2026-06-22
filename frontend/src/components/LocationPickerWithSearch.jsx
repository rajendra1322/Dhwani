import { useState, useEffect, useRef, useCallback } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"

function shortLocationLabel(label) {
  if (!label) return ""
  return label.split(",")[0].trim()
}

export default function LocationPickerWithSearch({ value, onChange, height = 300 }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [searchInput, setSearchInput] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(
    value || { lat: 12.9716, lng: 77.5946, label: "" }
  )
  const markerRef = useRef(null)

  useEffect(() => {
    if (!value) return
    setSelectedLocation((current) => ({ ...current, ...value }))
    if (value.label) {
      setSearchInput(value.label)
    }
  }, [value])

  // Initialize map
  const initializeMap = useCallback(() => {
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
      setSelectedLocation((current) => {
        const next = { ...current, lat: latLng.lat, lng: latLng.lng }
        onChange(next)
        return next
      })
    })

    map.current.on("click", (e) => {
      markerRef.current.setLatLng(e.latlng)
      setSelectedLocation((current) => {
        const next = { ...current, lat: e.latlng.lat, lng: e.latlng.lng }
        onChange(next)
        return next
      })
    })
  }, [onChange, selectedLocation.lat, selectedLocation.lng])

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
  }, [initializeMap])

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
    } catch {
      toast.error("Failed to search locations")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle location selection from search results
  const selectLocation = (location) => {
    const lat = parseFloat(location.lat)
    const lng = parseFloat(location.lon)
    const label = location.display_name
    const next = { lat, lng, label }
    setSelectedLocation(next)
    onChange(next)

    if (map.current && markerRef.current) {
      map.current.setView([lat, lng], 13)
      markerRef.current.setLatLng([lat, lng])
    }

    setSearchInput(label)
    setSearchResults([])
    toast.success("Location selected")
  }

  const commitSelection = () => {
    onChange(selectedLocation)
    toast.success(
      selectedLocation.label
        ? `Selected ${shortLocationLabel(selectedLocation.label)}`
        : "Location selected"
    )
  }

  return (
    <div className="relative space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch(searchInput)
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b5b49]" />
          <input
            type="text"
            placeholder="Search for a city, area, or address"
            value={searchInput}
            onChange={(e) => {
              const next = e.target.value
              setSearchInput(next)
              handleSearch(next)
            }}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 pl-9 text-sm text-[#1c1b1a] placeholder:text-[#8b7d6d] outline-none focus:border-[#1e2a5e]/30 focus:ring-2 focus:ring-[#1e2a5e]/10"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl border border-[#1e2a5e]/15 bg-[#1e2a5e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#15204a]"
        >
          Search
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-white shadow-xl">
          {searchResults.map((result, idx) => (
            <button
              key={idx}
              onClick={() => selectLocation(result)}
              className="flex w-full items-start justify-between gap-3 border-b border-black/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#1e2a5e]/[0.03]"
            >
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c45c26]" />
                <div>
                  <p className="line-clamp-1 text-sm font-medium text-[#1e2a5e]">
                    {shortLocationLabel(result.display_name)}
                  </p>
                  <p className="line-clamp-1 text-xs text-[#6b5b49]">
                    {result.display_name.split(",").slice(1).join(",").trim()}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#c45c26]/20 bg-[#fff3ea] px-3 py-1 text-xs font-medium text-[#c45c26]">
                Select
              </span>
            </button>
          ))}
        </div>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#c45c26]" />
          <span className="ml-2 text-xs text-[#6b5b49]">Searching...</span>
        </div>
      )}

      {/* Map */}
      <div
        ref={mapContainer}
        style={{ height: `${height}px` }}
        className="overflow-hidden rounded-xl border border-black/10 bg-white"
      />

      <button
        type="button"
        onClick={commitSelection}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e2a5e]/15 bg-[#1e2a5e] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#15204a]"
      >
        Select location
      </button>

      {/* Selected Location Info */}
      <div className="rounded-xl border border-black/10 bg-white p-3">
        <p className="mb-1 text-xs text-[#6b5b49]">Selected location</p>
        <p className="font-mono text-sm text-[#1c1b1a]">
          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </p>
        {selectedLocation.label && (
          <p className="mt-1 line-clamp-2 text-xs text-[#6b5b49]">
            {selectedLocation.label}
          </p>
        )}
      </div>
    </div>
  )
}
