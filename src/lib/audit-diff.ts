import { REDACTED, SENSITIVE_KEY } from './log-sanitize.ts';

type Json = Record<string, unknown>;

// Pasa a JSON plano (fechas ISO, sin undefined) y oculta campos sensibles por nombre.
export function toAuditJson(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toAuditJson);
  if (typeof value === 'object') {
    const out: Json = {};
    for (const [key, item] of Object.entries(value as Json)) {
      if (item === undefined) continue;
      out[key] = SENSITIVE_KEY.test(key) && item !== null ? REDACTED : toAuditJson(item);
    }
    return out;
  }
  return value;
}

// Devuelve solo los campos que cambiaron entre before y after.
export function diffObjects(before: unknown, after: unknown): { before: unknown; after: unknown } {
  const b = toAuditJson(before) as Json | null;
  const a = toAuditJson(after) as Json | null;
  if (!b || !a || typeof b !== 'object' || typeof a !== 'object') return { before: b, after: a };

  const changedBefore: Json = {};
  const changedAfter: Json = {};
  for (const key of new Set([...Object.keys(b), ...Object.keys(a)])) {
    if (JSON.stringify(b[key]) !== JSON.stringify(a[key])) {
      if (key in b) changedBefore[key] = b[key];
      if (key in a) changedAfter[key] = a[key];
    }
  }
  return { before: changedBefore, after: changedAfter };
}
