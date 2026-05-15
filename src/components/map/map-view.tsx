"use client";

import { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type AppLocale } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";

export type IdeaMapData = {
  id: string;
  title: string;
  status: string;
  district: string;
  category: string;
  supportCount: number;
  latitude: number;
  longitude: number;
};

const CLUJ_CENTER: [number, number] = [46.77, 23.59];
const DEFAULT_ZOOM = 13;

const statusColors: Record<string, string> = {
  SUBMITTED: "#64748b",
  UNDER_REVIEW: "#c2410c",
  ELIGIBLE: "#1e5f9e",
  IN_VOTING: "#7c3aed",
  SELECTED: "#0f766e",
  IN_PROGRESS: "#1e5f9e",
  COMPLETED: "#0f766e",
  REJECTED: "#dc2626",
};

function markerIcon(status: string) {
  const color = statusColors[status] ?? "#64748b";
  return L.divIcon({
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  });
}

function MapClickHandler({ onMapTap, markerClickedRef }: { onMapTap?: (lat: number, lng: number) => void; markerClickedRef: React.RefObject<boolean> }) {
  useMapEvents({
    click(e) {
      if (markerClickedRef.current) {
        markerClickedRef.current = false;
        return;
      }
      if (onMapTap) {
        onMapTap(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

type MapViewProps = {
  ideas: IdeaMapData[];
  compact?: boolean;
  defaultCenter?: [number, number];
  onMapTap?: (lat: number, lng: number) => void;
};

export default function MapView({ ideas, compact = false, defaultCenter = CLUJ_CENTER, onMapTap }: MapViewProps) {
  const t = useTranslations("Map");
  const ts = useTranslations("Statuses");
  const locale = useLocale() as AppLocale;
  const markerClickedRef = useRef(false);

  const handleMarkerClick = () => {
    markerClickedRef.current = true;
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className={`w-full rounded-sm border border-ink/8 ${compact ? "h-[280px] sm:h-[360px]" : "h-[500px] sm:h-[calc(100vh-200px)] min-h-[400px] max-h-[700px]"}`}
    >
      <MapClickHandler onMapTap={onMapTap} markerClickedRef={markerClickedRef} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {ideas.map((idea) => (
        <Marker
          key={idea.id}
          position={[idea.latitude, idea.longitude]}
          icon={markerIcon(idea.status)}
          eventHandlers={{ click: handleMarkerClick }}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1.5">
              <strong className="block text-sm font-serif text-ink">{idea.title}</strong>
              <div className="flex items-center gap-1.5">
                <Badge variant={statusToBadgeVariant(idea.status)}>
                  {ts(idea.status as Parameters<typeof ts>[0])}
                </Badge>
              </div>
              <span className="block text-xs text-ink-muted">
                {idea.supportCount} {t("support")}
              </span>
              <Link
                href={`/ideas/${idea.id}`}
                locale={locale}
                className="block text-xs text-civic-blue underline focus-visible:outline-2 focus-visible:ring-2"
              >
                {t("viewDetail")}
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
