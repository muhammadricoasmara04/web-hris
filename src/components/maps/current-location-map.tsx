"use client";

import type { Coordinates } from "@/hooks/maps/use-current-location";
import type { DivIcon, Map as LeafletMap } from "leaflet";
import { MapPinned, RefreshCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

type CurrentLocationMapProps = {
  center: Coordinates;
  loading: boolean;
  mapTitle: string;
  focusOffset?: "none" | "up";
  zoomControlPlacement?: "default" | "underNotification";
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
  focusOffset = "none",
  zoomControlPlacement = "default",
}: CurrentLocationMapProps) {
  const [markerIcon, setMarkerIcon] = useState<DivIcon | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

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

  const mapCenter = useMemo(() => {
    if (focusOffset === "up") {
      // Shift camera slightly south so marker appears visually higher on screen.
      return { lat: center.lat - 0.0034, lng: center.lng };
    }

    return center;
  }, [center, focusOffset]);

  const mapKey = useMemo(
    () => `${mapCenter.lat.toFixed(6)}-${mapCenter.lng.toFixed(6)}`,
    [mapCenter.lat, mapCenter.lng],
  );

  const handleRecenter = () => {
    if (!mapInstance) {
      return;
    }

    mapInstance.setView([mapCenter.lat, mapCenter.lng], 16, {
      animate: true,
      duration: 0.8,
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#071120]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_30%)]" />

      <MapContainer
        key={mapKey}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={16}
        zoomControl={false}
        attributionControl={true}
        className={`h-full w-full ${zoomControlPlacement === "underNotification" ? "map-zoom-under-notification" : ""}`}
        whenReady={(event) => {
          setMapInstance(event.target);
        }}
      >
        {mapInstance && (
          <ZoomControl position={zoomControlPlacement === "underNotification" ? "topright" : "bottomright"} />
        )}
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

      {zoomControlPlacement === "underNotification" ? (
        <button
          id="map-refresh-recenter-button"
          type="button"
          onClick={handleRecenter}
          className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-slate-900/95 text-white shadow-[0_14px_32px_rgba(5,10,22,0.5)] backdrop-blur-md transition active:scale-95"
          style={{
            position: "absolute",
            top: 206,
            right: 24,
            width: 40,
            height: 40,
            zIndex: 1400,
          }}
          aria-label="Refresh map ke posisi default"
          title="Kembali ke posisi default"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
