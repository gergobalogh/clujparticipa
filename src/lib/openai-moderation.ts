export const __SCAFFOLD__ = true;

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
  throw new Error("Not yet implemented -- RED scaffold");
}
