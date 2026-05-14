"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DISTRICT_CENTERS } from "@/lib/district-centers";

const CLUJ_CENTER: [number, number] = [46.77, 23.59];
const DEFAULT_ZOOM = 13;
const DISTRICT_ZOOM = 15;

const pickerIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#1d4ed8;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
});

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToDistrict({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (!center) return;
    const key = center.join(",");
    if (key === prevRef.current) return;
    prevRef.current = key;
    map.flyTo(center, DISTRICT_ZOOM, { duration: 0.8 });
  }, [center, map]);

  return null;
}

type MapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  districtCenter?: [number, number] | null;
};

export default function MapPicker({ latitude, longitude, onChange, districtCenter }: MapPickerProps) {
  return (
    <MapContainer
      center={latitude != null && longitude != null ? [latitude, longitude] : CLUJ_CENTER}
      zoom={latitude != null ? 15 : DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-[300px] w-full rounded-sm border border-ink/8"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickHandler onClick={onChange} />
      <FlyToDistrict center={districtCenter ?? null} />
      {latitude != null && longitude != null && (
        <Marker position={[latitude, longitude]} icon={pickerIcon} />
      )}
    </MapContainer>
  );
}
