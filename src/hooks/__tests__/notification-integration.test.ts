/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Acceptance: Notification namespace locale keys exist in all 3 locale files
// ---------------------------------------------------------------------------

describe("Notification locale keys", () => {
  const localeDir = path.resolve(__dirname, "../../i18n/messages");
  const locales = ["ro", "en", "hu"];

  it.each(locales)("locale '%s' contains Notification namespace with required keys", (locale) => {
    const filePath = path.join(localeDir, `${locale}.json`);
    const content = fs.readFileSync(filePath, "utf-8");
    const messages = JSON.parse(content);

    expect(messages.Notification).toBeDefined();
    expect(messages.Notification.optInTitle).toBeDefined();
    expect(messages.Notification.optInDescription).toBeDefined();
    expect(messages.Notification.optInAllow).toBeDefined();
    expect(messages.Notification.optInDismiss).toBeDefined();
    expect(messages.Notification.statusChangedBanner).toBeDefined();
  });
});
