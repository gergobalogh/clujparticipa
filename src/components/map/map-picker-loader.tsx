"use client";

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./map-picker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-md border border-slate-200 bg-slate-50 animate-pulse" />
  ),
});

export function MapPickerLoader(props: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  districtCenter?: [number, number] | null;
}) {
  return <MapPicker {...props} />;
}
