export type ModerationResult = { flagged: boolean; categories: string[] };

export type ModerationPort = (
  text: string,
  signal?: AbortSignal
) => Promise<ModerationResult>;

export async function moderateText(
  text: string,
  callModeration: ModerationPort,
  signal?: AbortSignal
): Promise<ModerationResult> {
  try {
    return await callModeration(text, signal);
  } catch (error: unknown) {
    console.warn("openai-moderation-fail-open", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { flagged: false, categories: [] };
  }
}
