import OpenAI from "openai";

export type ModerationResult = { flagged: boolean; categories: string[] };

const MODERATION_TIMEOUT_MS = 5_000;

export async function callOpenAIModeration(
  text: string,
  signal?: AbortSignal
): Promise<ModerationResult> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0,
  });

  const controller = signal ? undefined : new AbortController();
  const effectiveSignal = signal ?? controller!.signal;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (!signal) {
    timeoutId = setTimeout(() => controller!.abort(), MODERATION_TIMEOUT_MS);
  }

  try {
    const response = await client.moderations.create(
      { input: text },
      { signal: effectiveSignal }
    );

    const result = response.results[0];
    const flaggedCategories = Object.entries(result.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category);

    return {
      flagged: result.flagged,
      categories: flaggedCategories,
    };
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export async function probeOpenAI(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("openai-moderation-probe", {
      status: "skipped",
      reason: "OPENAI_API_KEY not set",
    });
    return false;
  }

  if (process.env.NODE_ENV === "test") {
    return true;
  }

  try {
    await callOpenAIModeration("test");
    return true;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.warn("openai-moderation-probe", {
      status: "failed",
      error: message,
    });
    return false;
  }
}
