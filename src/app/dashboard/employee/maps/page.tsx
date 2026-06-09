import { MapsLocationSection } from "@/components/maps/maps-location-section";

export const metadata = {
  title: "Maps Lokasi | Web HRIS",
  description:
    "Halaman peta lokasi real-time berbasis Leaflet untuk validasi koordinat dan attendance di Web HRIS.",
};

export default function MapsPage() {
  return <MapsLocationSection />;
}
