/** Email clients need literal inline CSS. These colors mirror the light palette;
 * email-template.test.ts checks them against globals.css to prevent drift.
 */
export const EMAIL_COLORS = {
  background: "#f3eee4",
  paper: "#fffdf8",
  foreground: "#2c2923",
  subtle: "#686156",
  border: "#c8bfaf",
  primary: "#373d38",
  primaryForeground: "#faf7f0",
} as const;

export const EMAIL_STYLES = {
  body: `margin:0;background:${EMAIL_COLORS.background};color:${EMAIL_COLORS.foreground};font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`,
  frame: "max-width:600px;margin:0 auto;padding:40px 24px",
  paper: `border-top:1px solid ${EMAIL_COLORS.border};border-bottom:1px solid ${EMAIL_COLORS.border};background:${EMAIL_COLORS.paper};padding:32px`,
  brand: `margin:0 0 20px;font-size:14px;color:${EMAIL_COLORS.subtle}`,
  heading:
    "margin:0 0 20px;font-size:24px;font-family:SimSun,'Songti SC',serif;font-weight:500",
  copy: "line-height:1.7",
  note: `line-height:1.7;color:${EMAIL_COLORS.subtle}`,
  action: `display:inline-block;border-radius:2px;background:${EMAIL_COLORS.primary};color:${EMAIL_COLORS.primaryForeground};text-decoration:none;padding:12px 20px`,
  code: "font-size:32px;font-weight:700;letter-spacing:0.2em",
} as const;
