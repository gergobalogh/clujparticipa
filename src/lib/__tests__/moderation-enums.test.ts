import { describe, it, expect } from "vitest";

describe("Moderation enums", () => {
  describe("CommentStatus", () => {
    it("includes FLAGGED alongside VISIBLE and HIDDEN", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { CommentStatus } = require("@prisma/client");
      expect(CommentStatus.VISIBLE).toBe("VISIBLE");
      expect(CommentStatus.HIDDEN).toBe("HIDDEN");
      expect(CommentStatus.FLAGGED).toBe("FLAGGED");
    });
  });

  describe("ModerationAction", () => {
    it("includes AUTO_FLAG and APPROVE alongside existing values", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ModerationAction } = require("@prisma/client");
      expect(ModerationAction.HIDE).toBe("HIDE");
      expect(ModerationAction.RESTORE).toBe("RESTORE");
      expect(ModerationAction.STATUS_CHANGE).toBe("STATUS_CHANGE");
      expect(ModerationAction.AUTO_FLAG).toBe("AUTO_FLAG");
      expect(ModerationAction.APPROVE).toBe("APPROVE");
    });
  });
});
