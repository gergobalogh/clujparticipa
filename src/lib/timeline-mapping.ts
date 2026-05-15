/** Timeline mapping — pure function transforming StatusChange[] to TimelineEntry[].
 *
 * This module bridges the data layer (StatusChange from API) and the
 * StatusChangeTimeline component (TimelineEntry). It applies resolveActorRole
 * to classify the actor, preserving all other fields.
 */
import { resolveActorRole } from "./actor-role-resolver";
import type { TimelineEntry } from "@/components/ideas/status-change-timeline";

type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  changedBy: string;
  createdAt: string;
};

/** Map an array of StatusChange records to TimelineEntry objects.
 *
 * Each StatusChange is transformed by:
 * - Preserving id, fromStatus, toStatus, note
 * - Using createdAt as the date
 * - Resolving changedBy to an ActorRole via resolveActorRole
 *
 * The input order is preserved (chronological from the API).
 */
export function mapStatusChangesToTimelineEntries(
  statusChanges: StatusChange[]
): TimelineEntry[] {
  return statusChanges.map((sc) => ({
    id: sc.id,
    date: sc.createdAt,
    fromStatus: sc.fromStatus,
    toStatus: sc.toStatus,
    actorRole: resolveActorRole(sc.changedBy),
    note: sc.note,
  }));
}
