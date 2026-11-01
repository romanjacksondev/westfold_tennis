import type { Prisma } from '../../prisma/generated/client';
import { prisma } from '@/utils/prisma';
import { logger } from '@/lib/logger';
import { getRequestContext } from '@/lib/request-context';
import { diffObjects, toAuditJson } from '@/lib/audit-diff';
import { maskEmail } from '@/lib/log-sanitize';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'TOURNAMENT_START'
  | 'TOURNAMENT_CANCEL'
  | 'TOURNAMENT_REACTIVATE'
  | 'DRAW_GENERATE'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'ACCESS_DENIED'
  | 'PHOTO_UPLOAD'
  | 'PHOTO_DELETE'
  | 'USERS_PLAYERS_UNIFY';

export type AuditActor = { id?: string | null; role?: string | null; email?: string | null } | null;

type SessionLike =
  { user?: { id?: string; role?: string; email?: string | null } } | null | undefined;

export const actorFromSession = (session: SessionLike): AuditActor =>
  session?.user
    ? {
        id: session.user.id ?? null,
        role: session.user.role ?? null,
        email: session.user.email ?? null,
      }
    : null;

export type AuditEntry = {
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  actor?: AuditActor;
  before?: unknown;
  after?: unknown;
  // Si se pasa, solo guarda los campos modificados entre before y after.
  diff?: boolean;
  metadata?: Record<string, unknown>;
  tx?: Pick<Prisma.TransactionClient, 'auditLog'>;
};

const toJson = (value: unknown) =>
  value === null || value === undefined ? undefined : (toAuditJson(value) as Prisma.InputJsonValue);

// Sin `tx` nunca lanza: un fallo de auditoría se loguea pero no rompe la operación principal.
export async function audit(entry: AuditEntry) {
  const ctx = getRequestContext();
  const { before, after } = entry.diff
    ? diffObjects(entry.before, entry.after)
    : { before: entry.before, after: entry.after };
  const data = {
    actorId: entry.actor?.id ?? null,
    actorRole: entry.actor?.role ?? null,
    actorEmail: entry.actor?.email ? maskEmail(entry.actor.email) : null,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    before: toJson(before),
    after: toJson(after),
    metadata: toJson({ requestId: ctx?.requestId, route: ctx?.route, ...entry.metadata }),
  };

  logger.info('audit', {
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    actorId: data.actorId,
  });

  if (entry.tx) {
    await entry.tx.auditLog.create({ data });
    return;
  }
  try {
    await prisma.auditLog.create({ data });
  } catch (err) {
    logger.error('audit.write_failed', {
      err,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
    });
  }
}

export const requestAuditMetadata = () => {
  const ctx = getRequestContext();
  return { ip: ctx?.ip ?? null, userAgent: ctx?.userAgent ?? null };
};
