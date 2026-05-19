/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { copyToClipboard } from "@/lib/clipboard";

/**
 * jsdom does not implement document.execCommand, so we must
 * define it as a mock before we can spy on it.
 */
function stubExecCommand(returnValue: boolean) {
  document.execCommand = vi.fn().mockReturnValue(returnValue);
}

function stubGetSelection() {
  window.getSelection = vi.fn().mockReturnValue({
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
  } as unknown as Selection);
}

describe("copyToClipboard", () => {
  let originalClipboard: Clipboard | undefined;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it("writes text to navigator.clipboard and returns true", async () => {
    const result = await copyToClipboard("https://example.com/ideas/abc?utm_source=copy");
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://example.com/ideas/abc?utm_source=copy"
    );
  });

  it("uses execCommand fallback and returns true when navigator.clipboard is unavailable", async () => {
    // @ts-expect-error -- testing missing clipboard API
    delete navigator.clipboard;
    stubExecCommand(true);
    stubGetSelection();

    const result = await copyToClipboard("test-url");

    expect(result).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("returns false when navigator.clipboard write fails and fallback also fails", async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Permission denied")
    );
    stubExecCommand(false);

    const result = await copyToClipboard("test-url");

    expect(result).toBe(false);
  });

  it("returns false when clipboard API is unavailable and fallback also fails", async () => {
    // @ts-expect-error -- testing missing clipboard API
    delete navigator.clipboard;
    stubExecCommand(false);

    const result = await copyToClipboard("test-url");

    expect(result).toBe(false);
  });
});
