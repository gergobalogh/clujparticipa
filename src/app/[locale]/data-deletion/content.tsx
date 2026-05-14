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
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-sm leading-6 text-ink-muted">{t("intro")}</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-base font-semibold text-ink">
            {t("facebookHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {t("facebookText")}
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">
            {t("emailHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {t("emailText", { email: t("contactEmail") })}
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">
            {t("whatIsDeletedHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {t("whatIsDeletedText")}
          </p>
          <p className="mt-2 text-sm italic leading-6 text-ink-muted">
            {t("retentionNote")}
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">
            {t("confirmationHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
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
              className="inline-flex items-center rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
            >
              {loading ? "..." : t("checkStatus")}
            </button>
          </form>

          {statusMessage && (
            <p
              className={`mt-4 text-sm ${
                result?.status === "completed"
                  ? "font-medium text-civic-teal"
                  : result === null
                    ? "text-civic-orange"
                    : "text-ink-muted"
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
