/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotificationOptIn } from "../use-notification-opt-in";

// ---------------------------------------------------------------------------
// Mock infrastructure for the Notification API
// ---------------------------------------------------------------------------

type MockNotificationConstructor = {
  new (): void;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
};

function createMockNotification(
  initialPermission: NotificationPermission = "default",
  requestResult?: NotificationPermission
): MockNotificationConstructor {
  const resolved = requestResult ?? initialPermission;
  return class MockNotification {
    static permission: NotificationPermission = initialPermission;
    static requestPermission = vi.fn().mockResolvedValue(resolved);
    constructor() {}
  };
}

// ---------------------------------------------------------------------------
// Acceptance: Returns permission state on mount
// ---------------------------------------------------------------------------

describe("useNotificationOptIn - Acceptance", () => {
  let originalNotification: unknown;

  beforeEach(() => {
    originalNotification = window.Notification;
  });

  afterEach(() => {
    // Restore or delete Notification after each test
    if (originalNotification === undefined) {
      // @ts-expect-error -- restoring original undefined state
      delete window.Notification;
    } else {
      // @ts-expect-error -- restoring original Notification
      window.Notification = originalNotification;
    }
  });

  it("returns permission='default' when Notification API reports default", () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("default"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.permission).toBe("default");
    expect(result.current.showInAppFallback).toBe(false);
  });

  it("returns permission='granted' when already granted", () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("granted"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.permission).toBe("granted");
    expect(result.current.showInAppFallback).toBe(false);
  });

  it("returns permission='denied' and showInAppFallback=true when already denied", () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("denied"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.permission).toBe("denied");
    expect(result.current.showInAppFallback).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Acceptance: requestPermission() updates state when user grants
  // -------------------------------------------------------------------------

  it("requestPermission() updates permission to 'granted' when user grants", async () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("default", "granted"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.permission).toBe("default");

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permission).toBe("granted");
    expect(result.current.showInAppFallback).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Acceptance: requestPermission() updates state when user denies
  // -------------------------------------------------------------------------

  it("requestPermission() updates permission to 'denied' when user denies", async () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("default", "denied"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permission).toBe("denied");
    expect(result.current.showInAppFallback).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Acceptance: Notification API unavailable - fallback behavior
  // -------------------------------------------------------------------------

  it("when Notification API unavailable, permission='denied' and showInAppFallback=true", () => {
    // Remove Notification API entirely
    // @ts-expect-error -- intentionally removing for test
    delete window.Notification;

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.permission).toBe("denied");
    expect(result.current.showInAppFallback).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Unit: SSR safety, requestPermission contract, initial permission matching
// ---------------------------------------------------------------------------

describe("useNotificationOptIn - Unit", () => {
  let originalNotification: unknown;

  beforeEach(() => {
    originalNotification = window.Notification;
  });

  afterEach(() => {
    if (originalNotification === undefined) {
      // @ts-expect-error -- restoring original undefined state
      delete window.Notification;
    } else {
      // @ts-expect-error -- restoring original Notification
      window.Notification = originalNotification;
    }
  });

  it("requestPermission returns a Promise", () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("default", "granted"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    const returnValue = result.current.requestPermission();
    expect(returnValue).toBeInstanceOf(Promise);
    // Prevent unhandled rejection
    returnValue.catch(() => {});
  });

  it("initial permission matches Notification.permission", () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("granted"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.permission).toBe("granted");
  });

  it("requestPermission() does not throw when Notification.requestPermission rejects", async () => {
    const MockNotification = createMockNotification("default");
    MockNotification.requestPermission = vi
      .fn()
      .mockRejectedValue(new Error("Permission request failed"));

    Object.defineProperty(window, "Notification", {
      value: MockNotification,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    await act(async () => {
      await result.current.requestPermission();
    });

    // Should not throw -- error is swallowed gracefully
    expect(result.current.permission).toBe("default");
  });

  it("when Notification API unavailable, requestPermission() does not throw", async () => {
    // @ts-expect-error -- intentionally removing for test
    delete window.Notification;

    const { result } = renderHook(() => useNotificationOptIn());

    await act(async () => {
      await result.current.requestPermission();
    });

    // Should remain in denied/fallback state
    expect(result.current.permission).toBe("denied");
    expect(result.current.showInAppFallback).toBe(true);
  });

  it("showInAppFallback is false when permission is 'default'", () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("default"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.showInAppFallback).toBe(false);
  });

  it("showInAppFallback is false when permission is 'granted'", () => {
    Object.defineProperty(window, "Notification", {
      value: createMockNotification("granted"),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNotificationOptIn());

    expect(result.current.showInAppFallback).toBe(false);
  });
});
