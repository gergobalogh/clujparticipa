import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the OpenAI SDK before importing the adapter
const mockCreate = vi.fn();
const MockOpenAI = vi.fn(function (
  this: { moderations: { create: typeof mockCreate } },
  _config: Record<string, unknown>
) {
  this.moderations = { create: mockCreate };
});
vi.mock("openai", () => {
  return {
    default: MockOpenAI,
  };
});

// Reset env between tests
const originalEnv = process.env;
const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  mockCreate.mockReset();
  process.env = { ...originalEnv };
  process.env.NODE_ENV = originalNodeEnv;
});

afterEach(() => {
  process.env = originalEnv;
  process.env.NODE_ENV = originalNodeEnv;
});

// Helper: dynamic import to pick up fresh mocks per test
async function importAdapter() {
  const mod = await import("@/lib/openai-moderation-adapter");
  return mod;
}

// ── callOpenAIModeration ──

describe("callOpenAIModeration", () => {
  it("returns { flagged: true, categories: [...] } when API flags content", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue({
      results: [
        {
          flagged: true,
          categories: { hate: true, harassment: true, violence: false },
        },
      ],
    });

    const { callOpenAIModeration } = await importAdapter();
    const result = await callOpenAIModeration("toxic text");

    expect(result.flagged).toBe(true);
    expect(result.categories).toEqual(["hate", "harassment"]);
  });

  it("returns { flagged: false, categories: [] } when API does not flag content", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue({
      results: [
        {
          flagged: false,
          categories: {
            hate: false,
            harassment: false,
            violence: false,
          },
        },
      ],
    });

    const { callOpenAIModeration } = await importAdapter();
    const result = await callOpenAIModeration("clean text");

    expect(result.flagged).toBe(false);
    expect(result.categories).toEqual([]);
  });

  it("calls OpenAI SDK with maxRetries=0", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue({
      results: [{ flagged: false, categories: {} }],
    });

    const OpenAI = (await import("openai")).default;
    const { callOpenAIModeration } = await importAdapter();
    await callOpenAIModeration("test");

    // The OpenAI constructor should have been called with maxRetries: 0
    const calls = vi.mocked(OpenAI).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(1);
    const config = calls[0][0] as Record<string, unknown>;
    expect(config.maxRetries).toBe(0);
  });

  it("passes input text to the moderation API", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue({
      results: [{ flagged: false, categories: {} }],
    });

    const { callOpenAIModeration } = await importAdapter();
    await callOpenAIModeration("some specific text");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ input: "some specific text" }),
      expect.any(Object) // RequestOptions with signal
    );
  });

  it("throws on API error", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockRejectedValue(new Error("OpenAI API returned 503"));

    const { callOpenAIModeration } = await importAdapter();

    await expect(callOpenAIModeration("text")).rejects.toThrow(
      "OpenAI API returned 503"
    );
  });

  it("throws on timeout (AbortError)", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockRejectedValue(
      new DOMException("The operation was aborted", "AbortError")
    );

    const { callOpenAIModeration } = await importAdapter();

    await expect(callOpenAIModeration("text")).rejects.toThrow();
  });

  it("creates a 5s AbortController timeout when no signal is provided", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue({
      results: [{ flagged: false, categories: {} }],
    });

    const { callOpenAIModeration } = await importAdapter();
    await callOpenAIModeration("text");

    // Verify the SDK was called with a signal in the RequestOptions
    const callArgs = mockCreate.mock.calls[0];
    const requestOptions = callArgs[1] as Record<string, unknown> | undefined;
    expect(requestOptions?.signal).toBeDefined();
    expect(typeof (requestOptions?.signal as AbortSignal).aborted).toBe(
      "boolean"
    );
  });

  it("uses the provided AbortSignal instead of creating one", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue({
      results: [{ flagged: false, categories: {} }],
    });

    const externalController = new AbortController();
    const { callOpenAIModeration } = await importAdapter();
    await callOpenAIModeration("text", externalController.signal);

    const callArgs = mockCreate.mock.calls[0];
    const requestOptions = callArgs[1] as Record<string, unknown> | undefined;
    expect(requestOptions?.signal).toBe(externalController.signal);
  });
});

// ── probeOpenAI ──

describe("probeOpenAI", () => {
  it("returns true when moderation call succeeds", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.NODE_ENV = "development";
    mockCreate.mockResolvedValue({
      results: [{ flagged: false, categories: {} }],
    });

    const { probeOpenAI } = await importAdapter();
    const result = await probeOpenAI();

    expect(result).toBe(true);
  });

  it("returns true in test environment without making API call", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.NODE_ENV = "test";

    const { probeOpenAI } = await importAdapter();
    const result = await probeOpenAI();

    expect(result).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns false and logs warning when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.NODE_ENV = "development";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { probeOpenAI } = await importAdapter();
    const result = await probeOpenAI();

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("openai-moderation-probe", {
      status: "skipped",
      reason: "OPENAI_API_KEY not set",
    });
  });

  it("returns false and logs warning when API call fails", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.NODE_ENV = "development";
    mockCreate.mockRejectedValue(new Error("Connection refused"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { probeOpenAI } = await importAdapter();
    const result = await probeOpenAI();

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("openai-moderation-probe", {
      status: "failed",
      error: "Connection refused",
    });
  });

  it("does not crash when API call throws unexpected error", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.NODE_ENV = "development";
    mockCreate.mockRejectedValue(new Error("Unexpected catastrophe"));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const { probeOpenAI } = await importAdapter();
    // Must not throw -- probeOpenAI catches and returns false
    const result = await probeOpenAI();

    expect(result).toBe(false);
  });
});
