/** Actor role resolver — maps changedBy identifier to a display role. */
export type ActorRole = "Admin" | "System" | "Department";

const KNOWN_ADMIN_PATTERNS = ["admin@", "moderator@"];

const isKnownAdminPattern = (changedBy: string): boolean =>
  KNOWN_ADMIN_PATTERNS.some((pattern) => changedBy.includes(pattern));

const isSystemExactMatch = (changedBy: string): boolean =>
  changedBy === "system";

export function resolveActorRole(changedBy: string): ActorRole {
  if (isKnownAdminPattern(changedBy)) return "Admin";
  if (isSystemExactMatch(changedBy)) return "System";
  return "Department";
}
