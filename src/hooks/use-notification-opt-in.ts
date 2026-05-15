"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationPermissionState = "default" | "granted" | "denied";

export type NotificationOptInResult = {
  permission: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermissionState>;
  showInAppFallback: boolean;
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function isNotificationAvailable(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

function readCurrentPermission(): NotificationPermissionState {
  if (!isNotificationAvailable()) {
    return "denied";
  }
  return window.Notification.permission;
}

function computeFallback(permission: NotificationPermissionState): boolean {
  return permission === "denied";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotificationOptIn(): NotificationOptInResult {
  const [permission, setPermission] =
    useState<NotificationPermissionState>(readCurrentPermission);
  const [showInAppFallback, setShowInAppFallback] = useState<boolean>(() =>
    computeFallback(readCurrentPermission())
  );

  // Re-probe after mount (handles SSR hydration mismatch)
  useEffect(() => {
    const current = readCurrentPermission();
    setPermission(current);
    setShowInAppFallback(computeFallback(current));
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!isNotificationAvailable()) {
      return "denied";
    }

    try {
      const result = await window.Notification.requestPermission();
      const normalized: NotificationPermissionState =
        result === "granted" ? "granted" : result === "denied" ? "denied" : "default";
      setPermission(normalized);
      setShowInAppFallback(computeFallback(normalized));
      return normalized;
    } catch {
      // Permission request failed -- keep current state, do not throw
      return permission;
    }
  }, [permission]);

  return { permission, requestPermission, showInAppFallback };
}
