/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StalledIndicator } from "../stalled-indicator";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

describe("StalledIndicator", () => {
  it("shows 'Waiting for' label with provided label text and Pipeline namespace", () => {
    const { container } = render(
      <StalledIndicator label="waitingForDepartmentReview" daysAgo={35} />
    );

    expect(container.textContent).toContain("Pipeline.waitingFor");
    expect(container.textContent).toContain("Stalled.waitingForDepartmentReview");
    expect(container.querySelector(".text-amber-500")).toBeInTheDocument();
  });

  it("shows days ago count with locale key for various values", () => {
    const cases = [
      { daysAgo: 0, label: "waitingForEligibility" },
      { daysAgo: 35, label: "waitingForDepartmentReview" },
      { daysAgo: 365, label: "waitingForImplementation" },
    ];

    for (const { daysAgo, label } of cases) {
      const { container, unmount } = render(
        <StalledIndicator label={label} daysAgo={daysAgo} />
      );

      expect(container.textContent).toContain(String(daysAgo));
      expect(container.textContent).toContain("Pipeline.daysAgo");

      unmount();
    }
  });

  it("renders nothing when label is empty (SUBMITTED/COMPLETED/REJECTED)", () => {
    const { container } = render(
      <StalledIndicator label="" daysAgo={0} />
    );

    expect(container.innerHTML).toBe("");
  });
});
