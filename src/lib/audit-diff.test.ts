/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { diffObjects, toAuditJson } from './audit-diff.ts';

describe('audit diff', () => {
  it('devuelve solo los campos modificados', () => {
    const out = diffObjects(
      { name: 'A', role: 'USER', n: 1 },
      { name: 'A', role: 'ADMIN', n: 1 },
    ) as any;
    assert.deepEqual(out.before, { role: 'USER' });
    assert.deepEqual(out.after, { role: 'ADMIN' });
  });

  it('oculta passwords y hashes y normaliza fechas', () => {
    const out = toAuditJson({
      email: 'a@b.com',
      password: 'secret',
      passwordHash: 'x',
      at: new Date('2026-01-01T00:00:00Z'),
      skip: undefined,
    }) as any;
    assert.equal(out.email, 'a@b.com');
    assert.equal(out.password, '[REDACTED]');
    assert.equal(out.passwordHash, '[REDACTED]');
    assert.equal(out.at, '2026-01-01T00:00:00.000Z');
    assert.ok(!('skip' in out));
  });

  it('en altas (sin before) conserva el after completo', () => {
    const out = diffObjects(null, { name: 'Nuevo' }) as any;
    assert.equal(out.before, null);
    assert.deepEqual(out.after, { name: 'Nuevo' });
  });

  it('un cambio de password se registra como redactado en ambos lados', () => {
    const out = diffObjects({ password: 'a' }, { password: 'b' }) as any;
    assert.deepEqual(out, { before: {}, after: {} });
  });
});
