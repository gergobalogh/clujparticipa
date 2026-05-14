"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useState, useImperativeHandle, forwardRef } from "react";
import {
  IMAGE_MAX_COUNT,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_ALLOWED_MIME_TYPES,
} from "@/lib/image-validation";
import { getOrCreateParticipantToken } from "@/lib/client-participant";
import { useSession } from "next-auth/react";

export interface ImageUploadResult {
  url: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  sizeBytes: number;
  order: number;
}

export interface ImageUploadHandle {
  upload: () => Promise<ImageUploadResult[]>;
}

interface ImageUploadProps {
  onUploadingChange: (uploading: boolean) => void;
}

interface PreviewFile {
  file: File;
  preview: string;
}

export const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  function ImageUpload({ onUploadingChange }, ref) {
    const t = useTranslations("ImageUpload");
    const { data: session } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<PreviewFile[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const previewsRef = useRef(previews);
    previewsRef.current = previews;

    const validateAndAddFiles = useCallback(
      (incoming: FileList | File[]) => {
        const newErrors: string[] = [];
        const files = Array.from(incoming);

        for (const file of files) {
          if (!(IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
            newErrors.push(t("invalidType", { name: file.name }));
            continue;
          }
          if (file.size > IMAGE_MAX_SIZE_BYTES) {
            newErrors.push(t("fileTooLarge", { name: file.name, max: "5" }));
            continue;
          }
        }

        const valid = files.filter(
          (f) =>
            (IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(f.type) &&
            f.size <= IMAGE_MAX_SIZE_BYTES
        );

        if (previewsRef.current.length + valid.length > IMAGE_MAX_COUNT) {
          newErrors.push(t("tooManyFiles", { max: String(IMAGE_MAX_COUNT) }));
          setErrors(newErrors);
          return;
        }

        const newPreviews = valid.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }));

        setPreviews((prev) => [...prev, ...newPreviews]);
        setErrors(newErrors);
      },
      [t]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        validateAndAddFiles(e.dataTransfer.files);
      },
      [validateAndAddFiles]
    );

    const handleFileInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          validateAndAddFiles(e.target.files);
          e.target.value = "";
        }
      },
      [validateAndAddFiles]
    );

    const removeFile = useCallback((index: number) => {
      setPreviews((prev) => {
        const next = [...prev];
        URL.revokeObjectURL(next[index].preview);
        next.splice(index, 1);
        return next;
      });
      setErrors([]);
    }, []);

    const uploadImages = useCallback(async (): Promise<ImageUploadResult[]> => {
      const currentPreviews = previewsRef.current;
      if (currentPreviews.length === 0) return [];

      setUploading(true);
      onUploadingChange(true);

      try {
        const formData = new FormData();
        currentPreviews.forEach((p) => formData.append("images", p.file));

        const headers: Record<string, string> = {};
        if (!session?.user) {
          headers["x-participant-token"] = getOrCreateParticipantToken();
        }
        const res = await fetch("/api/upload", {
          method: "POST",
          headers,
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setErrors([data.error || t("uploadFailed")]);
          return [];
        }

        const data = await res.json();
        return data.images;
      } catch {
        setErrors([t("uploadFailed")]);
        return [];
      } finally {
        setUploading(false);
        onUploadingChange(false);
      }
    }, [onUploadingChange, t, session?.user]);

    useImperativeHandle(ref, () => ({ upload: uploadImages }), [uploadImages]);

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700">
          {t("label")}
        </label>
        <p className="mt-1 text-xs text-slate-500">
          {t("hint", { max: String(IMAGE_MAX_COUNT), maxSize: "5" })}
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="mt-2 flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-blue-400 hover:bg-blue-50"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          aria-label={t("dropzoneLabel")}
        >
          <svg className="mb-1 h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm text-slate-600">{t("dropOrClick")}</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ALLOWED_MIME_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={handleFileInput}
          aria-label={t("fileInput")}
        />

        {previews.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((p, i) => (
              <li key={p.preview} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.preview}
                  alt={p.file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label={t("removeImage", { index: i + 1 })}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

        {errors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-600">{err}</li>
            ))}
          </ul>
        )}

        {uploading && (
          <p className="mt-2 text-sm text-blue-700">{t("uploading")}</p>
        )}
      </div>
    );
  }
);
