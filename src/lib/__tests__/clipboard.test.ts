import { describe, it, expect, vi, beforeEach } from "vitest";

// @ts-ignore -- RED scaffold import
import { copyToClipboard } from "@/lib/clipboard";

describe("copyToClipboard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("writes text to navigator.clipboard and returns true", async () => {
    const result = await copyToClipboard("https://example.com/ideas/abc?utm_source=copy");
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://example.com/ideas/abc?utm_source=copy"
    );
  });

  it("returns false when navigator.clipboard is unavailable", async () => {
    // @ts-expect-error — testing missing API
    delete navigator.clipboard;
    // Fall back to execCommand
    const execSpy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    const result = await copyToClipboard("test-url");
    expect(result).toBe(true);
    execSpy.mockRestore();
  });

  it("returns false when clipboard write fails", async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Permission denied")
    );
    const result = await copyToClipboard("test-url");
    expect(result).toBe(false);
  });
});
