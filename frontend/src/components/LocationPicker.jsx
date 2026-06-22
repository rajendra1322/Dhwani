import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import API from "../api.js";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon2x,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

/**
 * @param {{ lat: number, lng: number }} value
 * @param {(next: { lat: number, lng: number }) => void} onChange
 * @param {boolean} persistUserProfile PUT /api/user/location when user is logged in
 */
export default function LocationPicker({
  value,
  onChange,
  height = 280,
  persistUserProfile = false,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const persist = useCallback(
    async (lat, lng) => {
      if (!persistUserProfile) return;
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!token || user?.role !== "user") return;
      try {
        await API.put("/api/user/location", { lat, lng, label: "Home map" });
      } catch {
        /* ignore */
      }
    },
    [persistUserProfile]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const lat = value?.lat ?? 12.9716;
    const lng = value?.lng ?? 77.5946;
    const map = L.map(mapRef.current).setView([lat, lng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const p = marker.getLatLng();
      onChange({ lat: p.lat, lng: p.lng });
      persist(p.lat, p.lng);
    });
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      persist(e.latlng.lat, e.latlng.lng);
    });
    mapInstance.current = map;
    markerRef.current = marker;
    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  useEffect(() => {
    if (!markerRef.current || value == null) return;
    const m = markerRef.current.getLatLng();
    if (Math.abs(m.lat - value.lat) < 1e-6 && Math.abs(m.lng - value.lng) < 1e-6)
      return;
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapInstance.current?.setView([value.lat, value.lng], mapInstance.current.getZoom());
  }, [value]);

  return (
    <div
      ref={mapRef}
      className="w-full overflow-hidden rounded-2xl border border-black/10 z-0"
      style={{ height }}
    />
  );
}
