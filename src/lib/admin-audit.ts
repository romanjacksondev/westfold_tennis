/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/utils/prisma';
import { audit, type AuditAction, type AuditActor } from '@/lib/audit';
import { logger } from '@/lib/logger';

export const entityName = (modelName: string) =>
  modelName.charAt(0).toUpperCase() + modelName.slice(1);

const TOURNAMENT_ACTIONS: Record<string, AuditAction> = {
  start: 'TOURNAMENT_START',
  cancel: 'TOURNAMENT_CANCEL',
  reactivate: 'TOURNAMENT_REACTIVATE',
  finish: 'TOURNAMENT_FINISH',
};

export const auditActionFor = (resource: string, action: unknown): AuditAction =>
  resource === 'tournaments' && typeof action === 'string' && TOURNAMENT_ACTIONS[action]
    ? TOURNAMENT_ACTIONS[action]
    : 'UPDATE';

// Estado actual del registro (escalares; para torneos también los ids de jugadores). Nunca lanza.
export async function snapshotRecord(modelName: string, id: string) {
  try {
    const model = (prisma as any)[modelName];
    if (modelName === 'tournament') {
      const found = await model.findUnique({
        where: { id },
        include: { players: { select: { id: true } } },
      });
      if (!found) return null;
      const { players, ...tournament } = found;
      return { ...tournament, playerIds: players.map((p: { id: string }) => p.id).sort() };
    }
    return await model.findUnique({ where: { id } });
  } catch (err) {
    logger.warn('audit.snapshot_failed', { err, modelName, id });
    return null;
  }
}

export const auditAdminMutation = (params: {
  action: AuditAction;
  modelName: string;
  entityId: string;
  actor: AuditActor;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}) =>
  audit({
    action: params.action,
    entity: entityName(params.modelName),
    entityId: params.entityId,
    actor: params.actor,
    before: params.before,
    after: params.after,
    diff: params.before != null && params.after != null,
    metadata: params.metadata,
  });
