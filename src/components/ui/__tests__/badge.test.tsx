/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge new variants", () => {
  const variantClasses: Record<string, string> = {
    accepted: "bg-civic-teal-light text-civic-teal",
    needs_revision: "bg-amber-50 text-amber-700",
    merged: "bg-purple-50 text-purple-700",
    withdrawn: "bg-gray-100 text-gray-600",
  };

  it.each([
    { variant: "accepted" as const, expectedClass: "bg-civic-teal-light text-civic-teal" },
    { variant: "needs_revision" as const, expectedClass: "bg-amber-50 text-amber-700" },
    { variant: "merged" as const, expectedClass: "bg-purple-50 text-purple-700" },
    { variant: "withdrawn" as const, expectedClass: "bg-gray-100 text-gray-600" },
  ])(
    "renders $variant variant with correct Tailwind classes",
    ({ variant, expectedClass }) => {
      render(<Badge variant={variant}>Label</Badge>);
      const badge = screen.getByText("Label");
      for (const cls of expectedClass.split(" ")) {
        expect(badge.className, `missing class ${cls}`).toContain(cls);
      }
    }
  );
});
