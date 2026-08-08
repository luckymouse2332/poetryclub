export type ContentReaderScope = "anonymous" | "active_member" | "suspended";

export function canReadMembersOnlyPoems(scope: ContentReaderScope): boolean {
  return scope === "active_member";
}
