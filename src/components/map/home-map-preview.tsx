"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";
import type { IdeaMapData } from "./map-view";

const CLUJ_CENTER: [number, number] = [46.77, 23.59];

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] sm:h-[360px] w-full rounded-sm border border-ink/8 bg-paper-muted animate-pulse" />
  ),
});

type HomeMapPreviewProps = {
  ideas: IdeaMapData[];
  hero?: boolean;
};

function roundTo4Decimals(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function HomeMapPreview({ ideas, hero = false }: HomeMapPreviewProps) {
  const router = useRouter();

  const handleMapTap = useCallback(
    (lat: number, lng: number) => {
      const roundedLat = roundTo4Decimals(lat);
      const roundedLng = roundTo4Decimals(lng);
      router.push(`/ideas/new?lat=${roundedLat}&lng=${roundedLng}`);
    },
    [router]
  );

  return (
    <MapView
      ideas={ideas}
      compact={!hero}
      defaultCenter={CLUJ_CENTER}
      onMapTap={handleMapTap}
    />
  );
}
