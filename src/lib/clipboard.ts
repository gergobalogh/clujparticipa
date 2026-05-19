/**
 * Copy text to the system clipboard.
 *
 * Primary path: navigator.clipboard.writeText (secure contexts / modern browsers).
 * Fallback: document.execCommand("copy") via a hidden textarea (older browsers / insecure contexts).
 *
 * Returns true on success, false when the clipboard API is unavailable
 * or when both the primary and fallback paths fail.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (hasClipboardApi()) {
    const result = await tryWriteText(text);
    if (result) return true;
  }

  return fallbackCopy(text);
}

function hasClipboardApi(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.clipboard != null &&
    typeof navigator.clipboard.writeText === "function"
  );
}

async function tryWriteText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textarea = createTempTextarea(text);
  document.body.appendChild(textarea);
  selectTextareaContent(textarea);

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return success;
}

function createTempTextarea(text: string): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  return textarea;
}

function selectTextareaContent(textarea: HTMLTextAreaElement): void {
  textarea.focus();
  textarea.select();

  try {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(textarea);
      selection.addRange(range);
    }
  } catch {
    // Some browsers throw on selectNodeContents for textareas; select() is sufficient
  }
}
