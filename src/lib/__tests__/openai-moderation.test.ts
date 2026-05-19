import { describe, it, expect, vi } from "vitest";
import { moderateText, type ModerationPort } from "../openai-moderation";

const PASS_THROUGH: ModerationPort = async () => ({
  flagged: false,
  categories: [],
});

describe("moderateText", () => {
  it("returns the adapter result on success", async () => {
    const adapter: ModerationPort = async () => ({
      flagged: true,
      categories: ["hate", "harassment"],
    });

    const result = await moderateText("toxic text", adapter);

    expect(result).toEqual({ flagged: true, categories: ["hate", "harassment"] });
  });

  it("passes text and signal to the adapter", async () => {
    const adapter = vi.fn<Parameters<ModerationPort>, ReturnType<ModerationPort>>().mockResolvedValue({
      flagged: false,
      categories: [],
    });
    const signal = new AbortController().signal;

    await moderateText("some text", adapter, signal);

    expect(adapter).toHaveBeenCalledWith("some text", signal);
  });

  it("returns fail-open result when adapter throws an Error", async () => {
    const failAdapter: ModerationPort = async () => {
      throw new Error("OpenAI API returned 503");
    };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await moderateText("text", failAdapter);

    expect(result).toEqual({ flagged: false, categories: [] });
    expect(warnSpy).toHaveBeenCalledWith("openai-moderation-fail-open", {
      error: "OpenAI API returned 503",
    });

    warnSpy.mockRestore();
  });

  it("returns fail-open result when adapter throws a non-Error value", async () => {
    const failAdapter: ModerationPort = async () => {
      throw "string error";
    };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await moderateText("text", failAdapter);

    expect(result).toEqual({ flagged: false, categories: [] });
    expect(warnSpy).toHaveBeenCalledWith("openai-moderation-fail-open", {
      error: "string error",
    });

    warnSpy.mockRestore();
  });

  it("logs structured warning with openai-moderation-fail-open label on error", async () => {
    const failAdapter: ModerationPort = async () => {
      throw new Error("timeout");
    };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await moderateText("text", failAdapter);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "openai-moderation-fail-open",
      expect.objectContaining({ error: "timeout" })
    );

    warnSpy.mockRestore();
  });

  it("does not log a warning when adapter succeeds", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await moderateText("clean text", PASS_THROUGH);

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
