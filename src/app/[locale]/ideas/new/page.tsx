"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useState, useCallback, useRef } from "react";
import { MapPickerLoader } from "@/components/map/map-picker-loader";
import { DISTRICT_CENTERS } from "@/lib/district-centers";
import { getOrCreateParticipantToken } from "@/lib/client-participant";
import { ImageUpload, ImageUploadHandle, ImageUploadResult } from "@/components/ideas/image-upload";

const CATEGORIES = [
  "INFRASTRUCTURE", "EDUCATION", "ENVIRONMENT", "CULTURE",
  "SAFETY", "TRANSPORT", "HEALTH", "OTHER",
];

const DISTRICTS = [
  "MANASTUR", "GHEORGHENI", "ZORILOR", "CENTRU", "MARASTI",
  "GRIGORESCU", "IRIS", "GRUIA", "ANDREI_MURESANU", "BUNA_ZIUA",
  "BORHANCI", "DAMBU_ROTUND", "OTHER",
];

export default function NewIdeaPage() {
  const t = useTranslations("NewIdea");
  const tc = useTranslations("Categories");
  const td = useTranslations("Districts");
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [latitude, setLatitude] = useState<number | null>(46.77);
  const [longitude, setLongitude] = useState<number | null>(23.59);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [notifyOnStatusChange, setNotifyOnStatusChange] = useState(false);
  const imageUploadRef = useRef<ImageUploadHandle>(null);

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setUploadingImages(uploading);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!category) {
      setError(t("categoryLabel") + " — " + t("required"));
      return;
    }
    if (!district) {
      setError(t("districtLabel") + " — " + t("required"));
      return;
    }
    if (latitude == null || longitude == null) {
      setError(t("locationLabel") + " — " + t("required"));
      return;
    }

    setSubmitting(true);

    try {
      // Upload images first if component is present
      let images: ImageUploadResult[] | undefined;
      if (imageUploadRef.current) {
        const uploaded = await imageUploadRef.current.upload();
        if (uploaded.length > 0) images = uploaded;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (!session?.user) {
        headers["x-participant-token"] = getOrCreateParticipantToken();
      }

      const res = await fetch("/api/ideas", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          description,
          category,
          district,
          latitude,
          longitude,
          notifyOnStatusChange: session?.user ? notifyOnStatusChange : undefined,
          images,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error");
        return;
      }

      const data = await res.json();
      setCreatedId(data.id);
    } catch {
      setError("Error");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdId) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-lg font-medium text-green-700">{t("success")}</p>
        <Link
          href={`/ideas/${createdId}`}
          className="mt-4 inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          {t("viewIdea")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-slate-600">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="idea-title" className="block text-sm font-medium text-slate-700">
            {t("titleLabel")} <span className="text-red-600">*</span>
          </label>
          <input
            id="idea-title"
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="idea-desc" className="block text-sm font-medium text-slate-700">
            {t("descriptionLabel")} <span className="text-red-600">*</span>
          </label>
          <textarea
            id="idea-desc"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <ImageUpload
          ref={imageUploadRef}
          onUploadingChange={handleUploadingChange}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="idea-category" className="block text-sm font-medium text-slate-700">
              {t("categoryLabel")} <span className="text-red-600">*</span>
            </label>
            <select
              id="idea-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t("categoryPlaceholder")}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {tc(c as Parameters<typeof tc>[0])}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="idea-district" className="block text-sm font-medium text-slate-700">
              {t("districtLabel")} <span className="text-red-600">*</span>
            </label>
            <select
              id="idea-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t("districtPlaceholder")}</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {td(d as Parameters<typeof td>[0])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("locationLabel")} <span className="text-red-600">*</span>
          </label>
          <p className="mt-1 text-xs text-slate-500">{t("locationHint")}</p>
          <div className="mt-2">
            <MapPickerLoader
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              districtCenter={district ? DISTRICT_CENTERS[district] ?? null : null}
            />
          </div>
          {latitude != null && longitude != null && (
            <p className="mt-1 text-xs text-slate-500">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </p>
          )}
        </div>

        {session?.user && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifyOnStatusChange}
              onChange={(e) => setNotifyOnStatusChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">{t("notifyLabel")}</span>
          </label>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || uploadingImages}
          className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {submitting || uploadingImages ? t("submitting") : t("submit")}
        </button>
      </form>
    </main>
  );
}
