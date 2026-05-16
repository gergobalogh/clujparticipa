import { describe, it, expect } from "vitest";
import { statusToBadgeVariant, normalizeStatus } from "./status";

describe("normalizeStatus", () => {
  it("normalizes UNDER_REVIEW to IN_VOTING", () => {
    expect(normalizeStatus("UNDER_REVIEW")).toBe("IN_VOTING");
  });

  it("normalizes ELIGIBLE to IN_VOTING", () => {
    expect(normalizeStatus("ELIGIBLE")).toBe("IN_VOTING");
  });

  it("returns identity for current statuses", () => {
    expect(normalizeStatus("SUBMITTED")).toBe("SUBMITTED");
    expect(normalizeStatus("IN_VOTING")).toBe("IN_VOTING");
    expect(normalizeStatus("SELECTED")).toBe("SELECTED");
    expect(normalizeStatus("ACCEPTED")).toBe("ACCEPTED");
    expect(normalizeStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(normalizeStatus("COMPLETED")).toBe("COMPLETED");
    expect(normalizeStatus("REJECTED")).toBe("REJECTED");
    expect(normalizeStatus("NEEDS_REVISION")).toBe("NEEDS_REVISION");
    expect(normalizeStatus("MERGED")).toBe("MERGED");
    expect(normalizeStatus("WITHDRAWN")).toBe("WITHDRAWN");
  });
});

describe("statusToBadgeVariant", () => {
  it("maps SUBMITTED correctly", () => {
    expect(statusToBadgeVariant("SUBMITTED")).toBe("submitted");
  });

  it("normalizes UNDER_REVIEW to in_voting badge", () => {
    expect(statusToBadgeVariant("UNDER_REVIEW")).toBe("in_voting");
  });

  it("normalizes ELIGIBLE to in_voting badge", () => {
    expect(statusToBadgeVariant("ELIGIBLE")).toBe("in_voting");
  });

  it("maps IN_VOTING correctly", () => {
    expect(statusToBadgeVariant("IN_VOTING")).toBe("in_voting");
  });

  it("maps SELECTED correctly", () => {
    expect(statusToBadgeVariant("SELECTED")).toBe("selected");
  });

  it("maps ACCEPTED correctly", () => {
    expect(statusToBadgeVariant("ACCEPTED")).toBe("accepted");
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

  it("maps NEEDS_REVISION correctly", () => {
    expect(statusToBadgeVariant("NEEDS_REVISION")).toBe("needs_revision");
  });

  it("maps MERGED correctly", () => {
    expect(statusToBadgeVariant("MERGED")).toBe("merged");
  });

  it("maps WITHDRAWN correctly", () => {
    expect(statusToBadgeVariant("WITHDRAWN")).toBe("withdrawn");
  });

  it("returns default for unknown status", () => {
    expect(statusToBadgeVariant("UNKNOWN")).toBe("default");
  });
});
