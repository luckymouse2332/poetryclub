/** One lifecycle for browser wakeups; PostgreSQL snapshots remain authoritative. */
export function listenForNotificationChanges(
  stream: EventTarget & { close: () => void },
  refresh: () => void,
  setUnavailable: (value: boolean) => void,
  windowTarget: EventTarget = window,
  documentTarget: EventTarget & { visibilityState: string } = document,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reconcile = () => {
    setUnavailable(false);
    if (timer !== undefined) return;
    timer = setTimeout(() => { timer = undefined; refresh(); }, 100);
  };
  const unavailable = () => setUnavailable(true);
  const visible = () => { if (documentTarget.visibilityState === "visible") reconcile(); };
  for (const event of ["notification", "ready", "open"]) stream.addEventListener(event, reconcile);
  for (const event of ["unavailable", "error"]) stream.addEventListener(event, unavailable);
  windowTarget.addEventListener("focus", reconcile);
  documentTarget.addEventListener("visibilitychange", visible);
  return () => {
    clearTimeout(timer);
    for (const event of ["notification", "ready", "open"]) stream.removeEventListener(event, reconcile);
    for (const event of ["unavailable", "error"]) stream.removeEventListener(event, unavailable);
    windowTarget.removeEventListener("focus", reconcile);
    documentTarget.removeEventListener("visibilitychange", visible);
    stream.close();
  };
}
