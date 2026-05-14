"use client";

import dynamic from "next/dynamic";
import type { IdeaMapData } from "./map-view";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-md border border-slate-200 bg-slate-50 animate-pulse" />
  ),
});

export function MapLoader({ ideas }: { ideas: IdeaMapData[] }) {
  return <MapView ideas={ideas} />;
}
