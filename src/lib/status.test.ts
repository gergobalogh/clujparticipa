import { describe, it, expect } from "vitest";
import { statusToBadgeVariant } from "./status";

describe("statusToBadgeVariant", () => {
  it("maps SUBMITTED correctly", () => {
    expect(statusToBadgeVariant("SUBMITTED")).toBe("submitted");
  });

  it("maps UNDER_REVIEW correctly", () => {
    expect(statusToBadgeVariant("UNDER_REVIEW")).toBe("under_review");
  });

  it("maps ELIGIBLE correctly", () => {
    expect(statusToBadgeVariant("ELIGIBLE")).toBe("eligible");
  });

  it("maps IN_VOTING correctly", () => {
    expect(statusToBadgeVariant("IN_VOTING")).toBe("in_voting");
  });

  it("maps SELECTED correctly", () => {
    expect(statusToBadgeVariant("SELECTED")).toBe("selected");
  });

  it("maps IN_PROGRESS correctly", () => {
    expect(statusToBadgeVariant("IN_PROGRESS")).toBe("in_progress");
  });

  it("maps COMPLETED correctly", () => {
    expect(statusToBadgeVariant("COMPLETED")).toBe("completed");
  });

  it("maps REJECTED correctly", () => {
    expect(statusToBadgeVariant("REJECTED")).toBe("rejected");
  });

  it("returns default for unknown status", () => {
    expect(statusToBadgeVariant("UNKNOWN")).toBe("default");
  });
});
