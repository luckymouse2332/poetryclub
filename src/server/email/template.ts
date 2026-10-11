import { EMAIL_STYLES as styles } from "@/server/email/styles";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Structured content is escaped here; callers never supply raw HTML. */
export function renderTransactionalEmail({
  title,
  intro,
  action,
  code,
  expiry,
  note,
}: Readonly<{
  title: string;
  intro: string;
  action?: Readonly<{ href: string; label: string }>;
  code?: string;
  expiry: string;
  note: string;
}>): string {
  return `<!doctype html>
<html lang="zh-CN">
<body style="${styles.body}">
  <main style="${styles.frame}">
    <div style="${styles.paper}">
      <p style="${styles.brand}">回中诗社</p>
      <h1 style="${styles.heading}">${escapeHtml(title)}</h1>
      <p style="${styles.copy}">${escapeHtml(intro)}</p>
      ${action ? `<p style="margin:28px 0"><a href="${escapeHtml(action.href)}" style="${styles.action}">${escapeHtml(action.label)}</a></p>` : ""}
      ${code !== undefined ? `<p style="${styles.code}">${escapeHtml(code)}</p>` : ""}
      <p style="${styles.copy}">${escapeHtml(expiry)}</p>
      <p style="${styles.note}">${escapeHtml(note)}</p>
    </div>
  </main>
</body>
</html>`;
}
