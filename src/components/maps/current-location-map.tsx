"use client";

import type { Coordinates } from "@/hooks/maps/use-current-location";
import type { DivIcon } from "leaflet";
import { MapPinned } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

type CurrentLocationMapProps = {
  center: Coordinates;
  loading: boolean;
  mapTitle: string;
};

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const ZoomControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.ZoomControl),
  { ssr: false },
);

export function CurrentLocationMap({
  center,
  loading: _loading,
  mapTitle: _mapTitle,
}: CurrentLocationMapProps) {
  const [markerIcon, setMarkerIcon] = useState<DivIcon | null>(null);

  useEffect(() => {
    let isMounted = true;

    import("leaflet").then(({ divIcon }) => {
      if (!isMounted) {
        return;
      }

      setMarkerIcon(
        divIcon({
          className: "current-location-marker",
          html: `
            <div class="current-location-marker__core">
              <span class="current-location-marker__pulse"></span>
              <span class="current-location-marker__dot"></span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      );
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const mapKey = useMemo(
    () => `${center.lat.toFixed(6)}-${center.lng.toFixed(6)}`,
    [center.lat, center.lng],
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#071120]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_30%)]" />

      <MapContainer
        key={mapKey}
        center={[center.lat, center.lng]}
        zoom={16}
        zoomControl={false}
        attributionControl={true}
        className="h-full w-full"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markerIcon ? (
          <Marker position={[center.lat, center.lng]} icon={markerIcon}>
            <Popup>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <MapPinned className="h-4 w-4" />
                  Posisi Anda Saat Ini
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
