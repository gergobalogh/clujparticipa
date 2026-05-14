import { describe, it, expect } from "vitest";
import { resolveActorRole } from "../actor-role-resolver";

describe("resolveActorRole", () => {
  describe("admin pattern match (substring)", () => {
    it.each([
      ["admin@cluj.ro", "Admin"],
      ["moderator@city.cluj.ro", "Admin"],
      ["admin@any-domain.org", "Admin"],
      ["moderator@another.ro", "Admin"],
      ["Admin@cluj.ro", "Department"],
      ["Moderator@cluj.ro", "Department"],
    ] as const)("resolveActorRole('%s') => '%s'", (input, expected) => {
      expect(resolveActorRole(input)).toBe(expected);
    });
  });

  describe("system exact match", () => {
    it.each([
      ["system", "System"],
      ["system-actor@cluj.ro", "Department"],
      ["System", "Department"],
    ] as const)("resolveActorRole('%s') => '%s'", (input, expected) => {
      expect(resolveActorRole(input)).toBe(expected);
    });
  });

  describe("department default", () => {
    it.each([
      ["unknown-user@example.com", "Department"],
      ["", "Department"],
      ["   ", "Department"],
      ["some-dept@cluj.ro", "Department"],
    ] as const)("resolveActorRole('%s') => '%s'", (input, expected) => {
      expect(resolveActorRole(input)).toBe(expected);
    });
  });
});
