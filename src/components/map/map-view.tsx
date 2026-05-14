"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type AppLocale } from "@/i18n/routing";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

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

const statusToBadgeVariant: Record<string, BadgeVariant> = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
  ELIGIBLE: "default",
  IN_VOTING: "default",
  SELECTED: "default",
};

const statusColors: Record<string, string> = {
  SUBMITTED: "#64748b",
  UNDER_REVIEW: "#ca8a04",
  ELIGIBLE: "#2563eb",
  IN_VOTING: "#7c3aed",
  SELECTED: "#059669",
  IN_PROGRESS: "#2563eb",
  COMPLETED: "#16a34a",
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

type MapViewProps = {
  ideas: IdeaMapData[];
};

export default function MapView({ ideas }: MapViewProps) {
  const t = useTranslations("Map");
  const locale = useLocale() as AppLocale;

  return (
    <MapContainer
      center={CLUJ_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-[500px] w-full rounded-md border border-slate-200"
    >
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
        >
          <Popup>
            <div className="min-w-[180px] space-y-1.5">
              <strong className="block text-sm">{idea.title}</strong>
              <div className="flex items-center gap-1.5">
                <Badge variant={statusToBadgeVariant[idea.status] ?? "default"}>
                  {idea.status.replace(/_/g, " ").toLowerCase()}
                </Badge>
              </div>
              <span className="block text-xs text-slate-500">
                {idea.supportCount} support
              </span>
              <Link
                href={`/ideas/${idea.id}`}
                locale={locale}
                className="block text-xs text-blue-700 underline"
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
