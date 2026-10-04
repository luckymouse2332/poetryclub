import { expect, it, vi } from "vitest";
import { CommentPagination } from "@/features/comments/pagination";
const row = (id: string, body = id) => ({ id, body });

it("ignores a stale load response after an authoritative refresh", async () => {
  let finish!: (page: { items: ReturnType<typeof row>[]; nextCursor: string | null }) => void;
  const load = vi.fn(() => new Promise<{ items: ReturnType<typeof row>[]; nextCursor: string | null }>((resolve) => { finish = resolve; }));
  const pager = new CommentPagination({ items: [row("one")], nextCursor: "old" }, "v1", load, "append");
  const pending = pager.loadMore();
  const refreshing = pager.refresh({ items: [row("one", "fresh")], nextCursor: null }, "v2");
  await refreshing;
  finish({ items: [row("stale")], nextCursor: "stale cursor" }); await pending;
  expect(pager.getSnapshot().items).toEqual([row("one", "fresh")]);
  expect(pager.getSnapshot().nextCursor).toBeNull();
});

it("restores a pending next-page request when refresh cancels the old request", async () => {
  let release!: (page: { items: ReturnType<typeof row>[]; nextCursor: string | null }) => void;
  const load = vi.fn().mockImplementationOnce(() => new Promise((resolve) => { release = resolve; }))
    .mockResolvedValue({ items: [row("two", "fresh")], nextCursor: null });
  const pager = new CommentPagination({ items: [row("one")], nextCursor: "old" }, "v1", load, "append");
  const old = pager.loadMore();
  await pager.refresh({ items: [row("one")], nextCursor: "new" }, "v2");
  release({ items: [row("two", "stale")], nextCursor: null }); await old;
  expect(pager.getSnapshot().items).toEqual([row("one"), row("two", "fresh")]);
});

it("restores loaded depth even when the first page has unchanged content", async () => {
  const first = { items: [row("one")], nextCursor: "page2" };
  const load = vi.fn().mockResolvedValueOnce({ items: [row("two")], nextCursor: null })
    .mockResolvedValueOnce({ items: [row("two", "edited")], nextCursor: null });
  const pager = new CommentPagination(first, "v1", load, "append");
  await pager.loadMore(); await pager.refresh(first, "v2");
  expect(pager.getSnapshot().items).toEqual([row("one"), row("two", "edited")]);
});

it("prepends earlier replies, deduplicates, and synchronously prevents double loads", async () => {
  const load = vi.fn().mockResolvedValue({ items: [row("old"), row("new")], nextCursor: null });
  const pager = new CommentPagination({ items: [row("new")], nextCursor: "before" }, "v1", load, "prepend");
  await Promise.all([pager.loadMore(), pager.loadMore()]);
  expect(load).toHaveBeenCalledOnce();
  expect(pager.getSnapshot().items.map((item) => item.id)).toEqual(["old", "new"]);
});

it("aborts pending work on dispose", async () => {
  let signal!: AbortSignal;
  const pager = new CommentPagination({ items: [row("one")], nextCursor: "two" }, "v1", (_cursor, nextSignal) => {
    signal = nextSignal; return new Promise(() => {});
  }, "append");
  void pager.loadMore(); pager.dispose(); expect(signal.aborted).toBe(true);
});
