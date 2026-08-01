const DEFAULT_REDIRECT_PATH = "/";
const INTERNAL_ORIGIN = "https://poetryclub.invalid";
const MAX_REDIRECT_LENGTH = 2_048;
const MAX_DECODE_PASSES = 5;
const unsafeCharacterPattern = /[\\\u0000-\u001f\u007f]/;

function isSafePathAtDecodeLevel(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  if (unsafeCharacterPattern.test(value)) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(value, INTERNAL_ORIGIN);
  } catch {
    return false;
  }

  return (
    parsed.origin === INTERNAL_ORIGIN &&
    parsed.username === "" &&
    parsed.password === "" &&
    parsed.pathname.startsWith("/") &&
    !parsed.pathname.startsWith("//") &&
    !unsafeCharacterPattern.test(parsed.pathname)
  );
}

export function getSafeRedirectPath(
  value: unknown,
  fallback = DEFAULT_REDIRECT_PATH,
): string {
  const safeFallback =
    typeof fallback === "string" && isSafePathAtDecodeLevel(fallback)
      ? fallback
      : DEFAULT_REDIRECT_PATH;

  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_REDIRECT_LENGTH
  ) {
    return safeFallback;
  }

  let decoded = value;

  for (let pass = 0; pass < MAX_DECODE_PASSES; pass += 1) {
    if (!isSafePathAtDecodeLevel(decoded)) {
      return safeFallback;
    }

    let nextDecoded: string;
    try {
      nextDecoded = decodeURIComponent(decoded);
    } catch {
      return safeFallback;
    }

    if (nextDecoded === decoded) {
      return value;
    }

    decoded = nextDecoded;
  }

  return isSafePathAtDecodeLevel(decoded) ? value : safeFallback;
}

export function getLoginPath(returnTo: unknown): string {
  const safeReturnTo = getSafeRedirectPath(returnTo);
  return `/login?next=${encodeURIComponent(safeReturnTo)}`;
}
