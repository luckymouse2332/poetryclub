"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CommentPagination } from "./pagination";

export function useCommentPagination<T extends { id: string }>(
  endpoint: string,
  page: Readonly<{ items: ReadonlyArray<T>; nextCursor: string | null }>,
  revision: string,
  direction: "append" | "prepend",
) {
  // Callers key the list by poem/thread identity; snapshots refresh the same list.
  const [pager] = useState(() => new CommentPagination(page, revision, async (cursor, signal) => {
    const response = await fetch(`${endpoint}?cursor=${encodeURIComponent(cursor)}`, { cache: "no-store", signal });
    if (!response.ok) throw new Error("Unable to load comments");
    return response.json() as Promise<typeof page>;
  }, direction));
  const snapshot = useSyncExternalStore(pager.subscribe, pager.getSnapshot, pager.getSnapshot);
  useEffect(() => { void pager.refresh(page, revision); }, [pager, page, revision]);
  useEffect(() => () => pager.dispose(), [pager]);
  // Never display stale content/permissions while an authoritative snapshot arrives.
  return {
    ...(snapshot.revision === revision ? snapshot : { ...page, loading: true, error: false }),
    loadMore: () => pager.loadMore(),
  };
}
