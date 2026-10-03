type Page<T> = Readonly<{ items: ReadonlyArray<T>; nextCursor: string | null }>;
type Snapshot<T> = Page<T> & Readonly<{ revision: string; loading: boolean; error: boolean }>;

/** Owns request cancellation, cursor ordering and restoration of loaded history. */
export class CommentPagination<T extends { id: string }> {
  private snapshot: Snapshot<T>;
  private listeners = new Set<() => void>();
  private request?: AbortController;
  private loadedPages = 1;
  constructor(
    page: Page<T>, revision: string,
    private fetchPage: (cursor: string, signal: AbortSignal) => Promise<Page<T>>,
    private direction: "append" | "prepend",
  ) { this.snapshot = { ...page, revision, loading: false, error: false }; }

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private publish(update: Partial<Snapshot<T>>) {
    this.snapshot = { ...this.snapshot, ...update };
    this.listeners.forEach((listener) => listener());
  }
  private merge(current: ReadonlyArray<T>, incoming: ReadonlyArray<T>) {
    const seen = new Set(current.map((item) => item.id));
    const unique = incoming.filter((item) => !seen.has(item.id) && !!seen.add(item.id));
    return this.direction === "append" ? [...current, ...unique] : [...unique, ...current];
  }
  async loadMore() {
    if (this.request || !this.snapshot.nextCursor) return;
    const controller = new AbortController(); this.request = controller;
    this.publish({ loading: true, error: false });
    try {
      const page = await this.fetchPage(this.snapshot.nextCursor!, controller.signal);
      if (controller.signal.aborted) return;
      this.loadedPages++;
      this.publish({ items: this.merge(this.snapshot.items, page.items), nextCursor: page.nextCursor });
    } catch { if (!controller.signal.aborted) this.publish({ error: true }); }
    finally {
      if (this.request === controller) { this.request = undefined; this.publish({ loading: false }); }
    }
  }
  async refresh(page: Page<T>, revision: string) {
    if (revision === this.snapshot.revision) return;
    this.request?.abort();
    const controller = new AbortController(); this.request = controller;
    const depth = this.loadedPages;
    this.loadedPages = 1;
    this.publish({ ...page, revision, error: false, loading: depth > 1 && !!page.nextCursor });
    try {
      for (let index = 1; index < depth && this.snapshot.nextCursor; index++) {
        const next = await this.fetchPage(this.snapshot.nextCursor, controller.signal);
        if (controller.signal.aborted) return;
        this.loadedPages++;
        this.publish({ items: this.merge(this.snapshot.items, next.items), nextCursor: next.nextCursor });
      }
    } catch { if (!controller.signal.aborted) this.publish({ error: true }); }
    finally {
      if (this.request === controller) { this.request = undefined; this.publish({ loading: false }); }
    }
  }
  dispose() { this.request?.abort(); this.request = undefined; }
}
