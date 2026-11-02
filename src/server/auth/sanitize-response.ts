// 不维护易遗漏的固定字段黑名单，改为模式匹配：
// - 键名以 token 结尾（token、accessToken、resetToken、verificationToken、
//   sessionToken、csrf_token 等，大小写不敏感）一律剥离；
// - 键名含 password（password、passwordHash、newPassword 等）一律剥离。
// 该模式刻意保留 tokenCount 之类与凭据无关的计数字段。
const SENSITIVE_KEY_PATTERN = /token$|password/i;

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function omitSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(omitSensitiveFields);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !isSensitiveKey(key))
      .map(([key, nestedValue]) => [key, omitSensitiveFields(nestedValue)]),
  );
}

export async function sanitizeAuthResponse(response: Response): Promise<Response> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.toLowerCase().includes("application/json")) {
    return response;
  }

  let body: unknown;
  try {
    body = await response.clone().json();
  } catch {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(JSON.stringify(omitSensitiveFields(body)), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
