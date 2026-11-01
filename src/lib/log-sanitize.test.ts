/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { maskEmail, REDACTED, sanitizeLogValue, serializeError } from './log-sanitize.ts';

describe('sanitizeLogValue', () => {
  it('redacta claves sensibles a cualquier profundidad', () => {
    const out = sanitizeLogValue({
      user: 'a',
      password: 'x',
      nested: { apiToken: 't', Authorization: 'Bearer z', list: [{ passwordHash: 'h' }] },
    }) as any;
    assert.equal(out.password, REDACTED);
    assert.equal(out.nested.apiToken, REDACTED);
    assert.equal(out.nested.Authorization, REDACTED);
    assert.equal(out.nested.list[0].passwordHash, REDACTED);
    assert.equal(out.user, 'a');
  });

  it('enmascara emails', () => {
    assert.equal(maskEmail('roman@example.com'), 'r***@example.com');
    const out = sanitizeLogValue({
      email: 'roman@example.com',
      msg: 'fallo para ana@club.org ok',
    }) as any;
    assert.equal(out.email, 'r***@example.com');
    assert.equal(out.msg, 'fallo para a***@club.org ok');
  });

  it('trunca strings y listas largas y tolera referencias circulares', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const out = sanitizeLogValue({
      big: 'a'.repeat(900),
      items: Array.from({ length: 80 }, (_, i) => i),
      circular,
    }) as any;
    assert.ok(out.big.length < 600);
    assert.equal(out.items.length, 51);
    assert.equal(out.circular.self, '[Circular]');
  });

  it('serializa fechas y errores con código y causa', () => {
    const cause = new Error('db caída');
    const error = Object.assign(new Error('falló con a@b.com', { cause }), { code: 'P2002' });
    const out = serializeError(error) as any;
    assert.equal(out.code, 'P2002');
    assert.equal(out.message, 'falló con a***@b.com');
    assert.equal(out.cause.message, 'db caída');
    assert.equal(sanitizeLogValue(new Date('2026-01-01T00:00:00Z')), '2026-01-01T00:00:00.000Z');
  });
});
