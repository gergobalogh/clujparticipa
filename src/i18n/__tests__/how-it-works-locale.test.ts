import { describe, it, expect } from "vitest";
import en from "../messages/en.json";
import hu from "../messages/hu.json";
import ro from "../messages/ro.json";

const EXPECTED_KEYS = [
  "title",
  "subtitle",
  "forwardSection",
  "terminalSection",
  "cta",
  "ctaBrowse",
  "creatorCredit",
  "submittedDesc",
  "inVotingDesc",
  "selectedDesc",
  "acceptedDesc",
  "inProgressDesc",
  "completedDesc",
  "rejectedDesc",
  "needsRevisionDesc",
  "mergedDesc",
  "withdrawnDesc",
  "nextStep",
] as const;

const locales: Record<string, Record<string, unknown>> = {
  en,
  hu,
  ro,
};

describe("HowItWorks i18n namespace", () => {
  it("has all 18 keys in all 3 locale files", () => {
    for (const [localeName, messages] of Object.entries(locales)) {
      expect(
        messages,
        `${localeName}.json should parse as valid JSON`
      ).toBeDefined();

      const howItWorks = messages["HowItWorks"] as Record<string, unknown> | undefined;
      expect(
        howItWorks,
        `${localeName}.json should have a HowItWorks namespace`
      ).toBeDefined();

      for (const key of EXPECTED_KEYS) {
        expect(
          howItWorks![key],
          `${localeName}.json HowItWorks.${key} should exist`
        ).toBeDefined();
        expect(
          typeof howItWorks![key],
          `${localeName}.json HowItWorks.${key} should be a string`
        ).toBe("string");
        expect(
          (howItWorks![key] as string).length,
          `${localeName}.json HowItWorks.${key} should be non-empty`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("does not have extra keys beyond the 18 expected", () => {
    for (const [localeName, messages] of Object.entries(locales)) {
      const howItWorks = messages["HowItWorks"] as Record<string, unknown>;
      const actualKeys = Object.keys(howItWorks).sort();
      const expectedSorted = [...EXPECTED_KEYS].sort();
      expect(
        actualKeys,
        `${localeName}.json HowItWorks should have exactly 18 keys, no extras`
      ).toEqual(expectedSorted);
    }
  });

  it("preserves all existing namespaces unchanged", () => {
    const preservedNamespaces = [
      "Statuses",
      "Pipeline",
      "Exception",
      "MiniPipeline",
      "Stalled",
      "Timeline",
      "Notification",
    ];

    for (const [localeName, messages] of Object.entries(locales)) {
      for (const ns of preservedNamespaces) {
        expect(
          messages[ns],
          `${localeName}.json should still have ${ns} namespace`
        ).toBeDefined();
      }
    }
  });
});
