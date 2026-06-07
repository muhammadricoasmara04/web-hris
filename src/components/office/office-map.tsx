"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet when using Next.js/Webpack
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface OfficeMapProps {
  lat: number;
  lng: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
}

// Subcomponent to center the map when parent coordinates update
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
}

// Subcomponent that attaches click events directly to the map
function MapEventsHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function OfficeMap({ lat, lng, radius, onChange }: OfficeMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-white/10 bg-black/20">
        <p className="text-zinc-400 font-medium">Memuat Peta...</p>
      </div>
    );
  }

  // Ensure center has fallback coordinates if lat/lng are invalid numbers
  const centerLat = typeof lat === "number" && !isNaN(lat) ? lat : -6.200000;
  const centerLng = typeof lng === "number" && !isNaN(lng) ? lng : 106.816666;

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-inner relative z-10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[centerLat, centerLng]} />
        <Circle
          center={[centerLat, centerLng]}
          radius={radius || 100}
          pathOptions={{
            color: "#38bdf8",
            fillColor: "#0ea5e9",
            fillOpacity: 0.25,
            weight: 2,
          }}
        />
        <MapEventsHandler onChange={onChange} />
        <MapRecenter lat={centerLat} lng={centerLng} />
      </MapContainer>
    </div>
  );
}
