"use client";

import { useCallback, useEffect, useState } from "react";
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
  hero?: boolean;
};

function roundTo4Decimals(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function HomeMapPreview({ hero = false }: HomeMapPreviewProps) {
  const [ideas, setIdeas] = useState<IdeaMapData[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/ideas?limit=50")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        const filtered = (data.ideas ?? [])
          .filter(
            (i: { latitude: number; longitude: number }) =>
              Number.isFinite(i.latitude) &&
              Number.isFinite(i.longitude) &&
              i.latitude !== 0 &&
              i.longitude !== 0
          )
          .map((i: { id: string; title: string; status: string; district: string; category: string; supportCount: number; latitude: number; longitude: number }) => ({
            id: i.id,
            title: i.title,
            status: i.status,
            district: i.district,
            category: i.category,
            supportCount: i.supportCount,
            latitude: i.latitude,
            longitude: i.longitude,
          }));
        setIdeas(filtered);
      })
      .catch(() => setIdeas([]));
  }, []);

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
