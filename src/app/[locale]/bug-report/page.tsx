"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { getOrCreateParticipantToken } from "@/lib/client-participant";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function BugReportPage() {
  const t = useTranslations("BugReport");
  const { data: session } = useSession();

  const [description, setDescription] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (!session?.user) {
        headers["x-participant-token"] = getOrCreateParticipantToken();
      }

      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers,
        body: JSON.stringify({
          description,
          pageUrl: pageUrl || undefined,
          contactEmail: contactEmail || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-lg font-medium text-civic-teal">{t("success")}</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          {t("backHome")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Textarea
          label={t("descriptionLabel")}
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
        />

        <Input
          label={t("pageUrlLabel")}
          type="url"
          maxLength={500}
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          placeholder={t("pageUrlPlaceholder")}
        />

        <Input
          label={t("emailLabel")}
          type="email"
          maxLength={254}
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </form>
    </main>
  );
}
