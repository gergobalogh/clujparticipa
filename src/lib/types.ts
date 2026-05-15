/** Shared domain types used across multiple modules. */

/** A status change record as returned by the API. */
export type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  changedBy: string;
  createdAt: string;
};
