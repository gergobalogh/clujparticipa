"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { data: session } = useSession();
  const t = useTranslations("Auth");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (session?.user) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-ink-muted hover:text-ink hover:bg-paper-muted transition"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper-muted text-xs font-semibold text-ink">
              {session.user.name?.charAt(0) ?? "?"}
            </span>
          )}
          <span className="hidden sm:inline">{session.user.name}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-sm border border-ink/10 bg-paper py-1 shadow-lg">
            <div className="border-b border-ink/5 px-3 py-2 text-xs text-ink-muted">
              {session.user.email}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="block w-full px-3 py-2 text-left text-sm text-ink-muted hover:text-ink hover:bg-paper-muted transition"
            >
              {t("signOut")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="rounded-sm px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink hover:bg-paper-muted transition cursor-pointer"
    >
      {t("signIn")}
    </button>
  );
}
