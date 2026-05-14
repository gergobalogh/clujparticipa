"use client";

import dynamic from "next/dynamic";
import type { IdeaMapData } from "./map-view";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-sm border border-ink/8 bg-paper-muted animate-pulse" />
  ),
});

export function MapLoader({ ideas }: { ideas: IdeaMapData[] }) {
  return <MapView ideas={ideas} />;
}
