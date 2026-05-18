export const __SCAFFOLD__ = true;

export async function callOpenAIModeration(
  text: string,
  signal?: AbortSignal
): Promise<{ flagged: boolean; categories: string[] }> {
  throw new Error("Not yet implemented -- RED scaffold");
}

export async function probeOpenAI(): Promise<boolean> {
  throw new Error("Not yet implemented -- RED scaffold");
}
