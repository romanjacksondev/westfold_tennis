export const REDACTED = '[REDACTED]';

export const SENSITIVE_KEY =
  /pass|token|secret|auth|cookie|hash|key|credential|session|jwt|otp|signature/i;
const EMAIL = /^([^@\s])[^@\s]*(@[^@\s]+)$/;
const EMAIL_IN_TEXT = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
const MAX_STRING = 500;
const MAX_DEPTH = 6;
const MAX_ITEMS = 50;

export function maskEmail(value: string) {
  return value.replace(EMAIL_IN_TEXT, '$1***$2');
}

function sanitizeString(value: string) {
  const masked = EMAIL.test(value) ? value.replace(EMAIL, '$1***$2') : maskEmail(value);
  return masked.length > MAX_STRING
    ? `${masked.slice(0, MAX_STRING)}…[+${masked.length - MAX_STRING}]`
    : masked;
}

export function serializeError(error: unknown, depth = 0): Record<string, unknown> {
  if (!(error instanceof Error)) return { message: sanitizeString(String(error)) };
  const extra = error as Error & { code?: unknown; meta?: unknown; cause?: unknown };
  return {
    name: error.name,
    message: sanitizeString(error.message),
    ...(extra.code !== undefined ? { code: extra.code } : {}),
    ...(extra.meta !== undefined ? { meta: sanitizeLogValue(extra.meta, depth + 1) } : {}),
    ...(error.stack ? { stack: error.stack } : {}),
    ...(extra.cause !== undefined && depth < 3
      ? { cause: serializeError(extra.cause, depth + 1) }
      : {}),
  };
}

// Enmascara claves sensibles por nombre, emails y trunca strings/listas largas.
export function sanitizeLogValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return sanitizeString(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value !== 'object') return typeof value === 'function' ? undefined : value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return serializeError(value, depth);
  if (seen.has(value)) return '[Circular]';
  if (depth >= MAX_DEPTH) return '[MaxDepth]';
  seen.add(value);

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ITEMS).map((item) => sanitizeLogValue(item, depth + 1, seen));
    if (value.length > MAX_ITEMS) items.push(`[+${value.length - MAX_ITEMS} items]`);
    return items;
  }

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] =
      SENSITIVE_KEY.test(key) && item !== null && item !== undefined
        ? REDACTED
        : sanitizeLogValue(item, depth + 1, seen);
  }
  return out;
}
