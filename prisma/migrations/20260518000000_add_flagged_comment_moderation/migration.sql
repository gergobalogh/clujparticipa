-- Enum: add FLAGGED to CommentStatus (additive, zero downtime)
ALTER TYPE "CommentStatus" ADD VALUE IF NOT EXISTS 'FLAGGED';

-- Enum: add AUTO_FLAG and APPROVE to ModerationAction (additive, zero downtime)
ALTER TYPE "ModerationAction" ADD VALUE IF NOT EXISTS 'AUTO_FLAG';
ALTER TYPE "ModerationAction" ADD VALUE IF NOT EXISTS 'APPROVE';
