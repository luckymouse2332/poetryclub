const sensitiveFields = new Set([
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "password",
]);

function omitSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(omitSensitiveFields);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !sensitiveFields.has(key))
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
