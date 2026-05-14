"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

type DeletionStatus = {
  confirmationCode: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
} | null;

export function DataDeletionContent() {
  const t = useTranslations("DataDeletion");
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("confirmation_code");

  const [code, setCode] = useState(codeFromUrl || "");
  const [result, setResult] = useState<DeletionStatus>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (codeFromUrl) {
      checkStatus(codeFromUrl);
    }
  }, [codeFromUrl]);

  async function checkStatus(codeToCheck: string) {
    setLoading(true);
    setChecked(false);
    try {
      const res = await fetch(
        `/api/data-deletion-status?code=${encodeURIComponent(codeToCheck)}`,
      );
      if (res.status === 404) {
        setResult(null);
      } else if (res.ok) {
        setResult(await res.json());
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) checkStatus(code.trim());
  };

  const statusMessage = checked
    ? result === null
      ? t("statusNotFound")
      : result.status === "completed"
        ? t("statusCompleted", { code: result.confirmationCode })
        : result.status === "pending"
          ? t("statusPending")
          : t("statusFailed")
    : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-sm leading-6 text-slate-600">{t("intro")}</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-base font-semibold text-slate-950">
            {t("facebookHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("facebookText")}
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">
            {t("emailHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("emailText", { email: t("contactEmail") })}
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">
            {t("whatIsDeletedHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("whatIsDeletedText")}
          </p>
          <p className="mt-2 text-sm italic leading-6 text-slate-500">
            {t("retentionNote")}
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-950">
            {t("confirmationHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("confirmationText")}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <Input
                label={t("confirmationCodeLabel")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "..." : t("checkStatus")}
            </button>
          </form>

          {statusMessage && (
            <p
              className={`mt-4 text-sm ${
                result?.status === "completed"
                  ? "font-medium text-green-700"
                  : result === null
                    ? "text-amber-600"
                    : "text-slate-600"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
