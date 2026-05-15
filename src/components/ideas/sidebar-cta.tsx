"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Send } from "lucide-react";
import { motion } from "motion/react";

export function SidebarCta() {
  const t = useTranslations("Home");

  return (
    <Link href="/ideas/new" className="mt-auto block w-full">
      <motion.button
        className="flex w-full items-center justify-center gap-2 bg-ink text-paper px-4 py-3 rounded-sm transition cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Send className="h-4 w-4" />
        <span className="uppercase tracking-wide text-sm font-medium">
          {t("sendIdea")}
        </span>
      </motion.button>
    </Link>
  );
}
