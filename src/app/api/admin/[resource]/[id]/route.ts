import { prisma } from '@/utils/prisma';
import { requireAdmin } from '@/lib/require-session';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { didPlayerLevelChange } from '@/utils/levels';
import { actorFromSession } from '@/lib/audit';
import { auditActionFor, auditAdminMutation, snapshotRecord } from '@/lib/admin-audit';
import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { buildSetData, type MatchSetInput } from '@/lib/match-sets';
import { DrawError } from '@/lib/draw-persistence';
import { confirmDraw } from '@/lib/draw-service';
import { changeDrawWinner, closeTournament, refreshChampion, unlinkDrawResult } from '@/lib/draw-results';
import { audit } from '@/lib/audit';

const models = {
  players: 'player',
  venues: 'venue',
  surfaces: 'surface',
  'tournament-types': 'tournamentType',
  'tournament-categories': 'tournamentCategory',
  tournaments: 'tournament',
  matches: 'match',
  users: 'user',
  levels: 'level',
} as const;

type Context = { params: Promise<{ resource: string; id: string }> };

async function updateRecord(request: NextRequest, context: Context) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { resource, id } = await context.params;
  const modelName = models[resource as keyof typeof models];
  if (!modelName) return NextResponse.json({ message: 'Recurso inválido' }, { status: 404 });

  try {
    const body = await request.json();
    const data = { ...body };
    delete data.id;
    delete data.deletedAt;
    if (resource === 'matches') {
      const current = await prisma.match.findFirst({
        where: { id, deletedAt: null },
        include: { drawMatch: { select: { id: true, player1Id: true } }, tournament: { select: { id: true, status: true, championId: true } } },
      });
      if (current?.drawMatch && current.tournament) {
        const changed = (['tournamentId', 'player1Id', 'player2Id', 'stage'] as const).filter(
          (key) => key in data && (data[key] || null) !== (current[key] ?? null),
        );
        if (changed.length > 0) {
          return NextResponse.json({ message: 'Los jugadores, el torneo y la fase de un partido del cuadro no se pueden modificar' }, { status: 400 });
        }
        const { status, championId: championBefore } = current.tournament;
        if (status !== 'IN_PROGRESS' && status !== 'FINISHED') {
          return NextResponse.json({ message: 'Solo se pueden corregir partidos de torneos en curso o finalizados' }, { status: 409 });
        }
        const finished = status === 'FINISHED';
        const reason = typeof data.reason === 'string' ? data.reason.trim() : '';
        if (finished && !reason) {
          return NextResponse.json({ message: 'Corregir un torneo finalizado requiere indicar el motivo' }, { status: 400 });
        }
        const walkover = typeof data.walkover === 'boolean' ? data.walkover : current.walkover;
        const newSets = Array.isArray(data.sets) ? (data.sets as MatchSetInput[]) : null;
        let winnerId = data.winnerId ? String(data.winnerId) : current.winnerId;
        if (newSets) {
          const players = [current.player1Id, current.player2Id];
          if (newSets.some((set) => !players.includes(set.winner))) {
            return NextResponse.json({ message: 'El ganador de cada set debe ser uno de los dos jugadores' }, { status: 400 });
          }
          if (!walkover) {
            const first = newSets.filter((set) => set.winner === current.player1Id).length;
            if (newSets.length === 0 || first * 2 === newSets.length) {
              return NextResponse.json({ message: 'El partido no puede quedar empatado en sets' }, { status: 400 });
            }
            winnerId = first * 2 > newSets.length ? current.player1Id : current.player2Id;
          }
        }
        if (winnerId !== current.player1Id && winnerId !== current.player2Id) {
          return NextResponse.json({ message: 'El ganador debe ser uno de los dos jugadores del partido' }, { status: 400 });
        }
        const playedAt = data.playedAt ? new Date(data.playedAt) : current.playedAt;
        if (playedAt && Number.isNaN(playedAt.getTime())) {
          return NextResponse.json({ message: 'La fecha del partido es inválida' }, { status: 400 });
        }
        const outcome = await prisma.$transaction(async (tx) => {
          if (newSets) {
            await tx.game.deleteMany({ where: { set: { matchId: id } } });
            await tx.set.deleteMany({ where: { matchId: id } });
          }
          const updated = await tx.match.update({
            where: { id },
            data: {
              winnerId,
              playedAt,
              walkover,
              ...(newSets ? { sets: { create: buildSetData(newSets, current.drawMatch!.player1Id ?? current.player1Id, current.drawMatch!.player1Id === current.player2Id ? current.player1Id : current.player2Id) } } : {}),
            },
          });
          if (winnerId !== current.winnerId) await changeDrawWinner(tx, current.drawMatch!.id, winnerId);
          let championAfter = championBefore;
          if (finished) {
            championAfter = await refreshChampion(tx, current.tournament!.id);
            if (championAfter !== championBefore) await tx.tournament.update({ where: { id: current.tournament!.id }, data: { championId: championAfter } });
          }
          return { updated, championAfter };
        });
        if (finished) {
          await audit({
            action: 'TOURNAMENT_CORRECTION',
            entity: 'Tournament',
            entityId: current.tournament.id,
            actor: actorFromSession(session),
            before: { championId: championBefore, winnerId: current.winnerId, walkover: current.walkover },
            after: { championId: outcome.championAfter, winnerId, ...(newSets ? { sets: newSets.length, walkover } : {}) },
            metadata: { reason, matchId: id, championChanged: outcome.championAfter !== championBefore },
          });
        }
        const championChanged = finished && outcome.championAfter !== championBefore;
        return NextResponse.json({
          data: outcome.updated,
          championChanged,
          message: championChanged ? 'Resultado corregido. Atención: el campeón del torneo cambió' : 'Resultado corregido correctamente',
        });
      }
    }
    if (resource === 'tournaments' && data.action) {
      const action = data.action;
      if (action === 'start') {
        const tournament = await prisma.tournament.findUnique({
          where: { id },
          include: { players: { select: { id: true } } },
        });
        if (!tournament) return NextResponse.json({ message: 'Torneo no encontrado' }, { status: 404 });
        if (tournament.status !== 'PREPARATION') {
          return NextResponse.json({ message: 'Solo se pueden iniciar torneos que estén en preparación' }, { status: 400 });
        }
        if (!tournament.name?.trim()) return NextResponse.json({ message: 'El torneo debe tener un nombre asignado' }, { status: 400 });
        if (!tournament.venueId) return NextResponse.json({ message: 'Se debe seleccionar una sede' }, { status: 400 });
        if (!tournament.surfaceId) return NextResponse.json({ message: 'Se debe seleccionar una superficie' }, { status: 400 });
        if (!tournament.tournamentCategoryId) return NextResponse.json({ message: 'Se debe seleccionar una categoría' }, { status: 400 });
        if (!tournament.tournamentTypeId) return NextResponse.json({ message: 'Se debe seleccionar un formato/tipo de torneo' }, { status: 400 });
        if (!tournament.drawSize || tournament.drawSize < 2) {
          return NextResponse.json({ message: 'El tamaño del cuadro debe ser de al menos 2 participantes' }, { status: 400 });
        }
        if (tournament.players.length < 2) {
          return NextResponse.json({ message: 'Se deben confirmar al menos 2 jugadores para iniciar el torneo' }, { status: 400 });
        }
        if (tournament.players.length > tournament.drawSize) {
          return NextResponse.json({ message: `Los jugadores confirmados (${tournament.players.length}) superan el tamaño del cuadro (${tournament.drawSize})` }, { status: 400 });
        }
        if (tournament.drawStatus === 'NONE') {
          return NextResponse.json({ message: 'Generá el sorteo del cuadro antes de iniciar el torneo' }, { status: 400 });
        }
        if (tournament.drawStatus === 'DRAFT') await confirmDraw(id, actorFromSession(session));
        const updated = await prisma.tournament.update({
          where: { id },
          data: { status: 'IN_PROGRESS' },
        });
        return NextResponse.json({ data: updated, message: '¡Torneo iniciado con éxito! Estado: En curso' });
      }
      if (action === 'finish') {
        const updated = await closeTournament(prisma, id);
        return NextResponse.json({ data: updated, message: 'Torneo cerrado. El campeón se calculó a partir de los resultados' });
      }
      if (action === 'cancel') {
        const updated = await prisma.tournament.update({ where: { id }, data: { status: 'CANCELLED' } });
        return NextResponse.json({ data: updated, message: 'Torneo cancelado correctamente' });
      }
      if (action === 'reactivate') {
        const current = await prisma.tournament.findUnique({
          where: { id },
          select: { championId: true, finishedAt: true, matches: { select: { id: true }, take: 1 } },
        });
        let status: 'PREPARATION' | 'IN_PROGRESS' | 'FINISHED' = 'PREPARATION';
        let finishedAt: Date | null = null;
        if (current?.championId) {
          status = 'FINISHED';
          finishedAt = current.finishedAt ?? new Date();
        } else if (current?.matches && current.matches.length > 0) {
          status = 'IN_PROGRESS';
        } else {
          status = 'PREPARATION';
        }
        const updated = await prisma.tournament.update({ where: { id }, data: { status, finishedAt } });
        return NextResponse.json({ data: updated, message: 'Torneo reactivado correctamente' });
      }
      return NextResponse.json({ message: 'Acción inválida' }, { status: 400 });
    }
    delete data.action;
    delete data.status;
    delete data.finishedAt;
    delete data.createdAt;
    if (resource === 'users') {
      const current = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true, player: { select: { id: true } } } });
      if (current?.role === 'ADMIN' && current.isActive && (data.role === 'USER' || data.isActive === false)) {
        const activeAdmins = await prisma.user.count({ where: { role: 'ADMIN', isActive: true, deletedAt: null } });
        if (activeAdmins <= 1) return NextResponse.json({ message: 'No se puede quitar acceso al último administrador activo' }, { status: 409 });
      }
      if (data.email) data.email = String(data.email).trim().toLowerCase();
      if (data.password) data.password = await bcrypt.hash(String(data.password), 12);
      else delete data.password;
      if (data.role && !['USER', 'ADMIN'].includes(data.role)) throw new Error('Rol inválido');

      if ('playerId' in data) {
        const newPlayerId = data.playerId ? String(data.playerId).trim() : null;
        delete data.playerId;
        if (newPlayerId) {
          const otherUser = await prisma.user.findFirst({
            where: { player: { id: newPlayerId }, id: { not: id }, deletedAt: null },
          });
          if (otherUser) {
            throw new Error(`El jugador seleccionado ya está vinculado al usuario ${otherUser.email}`);
          }
          data.player = { connect: { id: newPlayerId } };
        } else {
          if (current?.player) {
            data.player = { disconnect: true };
          }
        }
      }

      const updated = await (prisma as any)[modelName].update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, isActive: true, player: { select: { id: true, name: true, lastname: true, nickname: true } } }
      });
      return NextResponse.json({ data: updated, message: 'Usuario actualizado correctamente' });
    }
    if (resource === 'players') {
      delete data.photoUrl;
      delete data.photoThumbUrl;
      if ('levelId' in data || 'levelReason' in data) {
        const newLevelId = data.levelId ? String(data.levelId) : null;
        const reason = typeof data.levelReason === 'string' ? data.levelReason.trim() || null : null;
        delete data.levelId;
        delete data.levelReason;
        const currentPlayer = await prisma.player.findUnique({ where: { id }, select: { levelId: true } });
        if (didPlayerLevelChange(currentPlayer?.levelId, newLevelId)) {
          data.level = newLevelId ? { connect: { id: newLevelId } } : { disconnect: true };
          data.levelHistory = { create: { levelId: newLevelId, reason } };
        }
      }
      if ('userId' in data) {
        const newUserId = data.userId ? String(data.userId).trim() : null;
        delete data.userId;
        const currentPlayer = await prisma.player.findUnique({ where: { id }, select: { userId: true } });
        if (newUserId) {
          const otherPlayer = await prisma.player.findFirst({
            where: { userId: newUserId, id: { not: id }, deletedAt: null },
          });
          if (otherPlayer) {
            throw new Error(`El usuario seleccionado ya está vinculado al jugador ${otherPlayer.name}`);
          }
          data.user = { connect: { id: newUserId } };
        } else {
          if (currentPlayer?.userId) {
            data.user = { disconnect: true };
          }
        }
      }
    }
    if (resource === 'levels' && 'order' in data) data.order = Number(data.order);
    if (data.date) data.date = new Date(data.date);
    if (resource === 'tournaments') {
      const currentTournament = await prisma.tournament.findUnique({ where: { id }, select: { status: true } });
      // The level is only a label, so it can still be assigned once the tournament is finished.
      const onlyLevel = Object.keys(data).every((key) => key === 'levelId');
      if (currentTournament?.status === 'FINISHED' && !onlyLevel) {
        return NextResponse.json({ message: 'Los torneos terminados no pueden ser editados' }, { status: 400 });
      }
      delete data.championId; // the champion is computed from the results (see the "finish" action)
      const drawState = await prisma.tournament.findUnique({
        where: { id },
        select: { drawStatus: true, tournamentTypeId: true, qualifiers: true, players: { select: { id: true } } },
      });
      if (drawState && drawState.drawStatus !== 'NONE') {
        const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((value) => b.includes(value));
        const nextQualifiers = 'qualifiers' in data ? (data.qualifiers !== '' && data.qualifiers != null ? Number(data.qualifiers) : null) : drawState.qualifiers;
        const locked =
          ('playerIds' in data && !sameIds(Array.isArray(data.playerIds) ? data.playerIds : [], drawState.players.map((p) => p.id))) ||
          ('tournamentTypeId' in data && (data.tournamentTypeId || null) !== drawState.tournamentTypeId) ||
          (nextQualifiers ?? 0) !== (drawState.qualifiers ?? 0);
        if (locked) {
          return NextResponse.json({ message: 'El torneo ya tiene un sorteo: anulalo para cambiar los participantes, el formato o los clasificados' }, { status: 409 });
        }
      }
      // Handle drawSize / qualifiers as nullable integers
      if ('drawSize' in data) {
        data.drawSize = data.drawSize !== undefined && data.drawSize !== '' ? Number(data.drawSize) : null;
      }
      if ('qualifiers' in data) {
        data.qualifiers = data.qualifiers !== undefined && data.qualifiers !== '' ? Number(data.qualifiers) : null;
      }
      // Sync players many-to-many (use `set` so checklist can add and remove)
      if ('playerIds' in data) {
        const playerIds: string[] = Array.isArray(data.playerIds) ? data.playerIds : [];
        data.players = { set: playerIds.map((pid: string) => ({ id: pid })) };
        delete data.playerIds;
      }
      if ('levelId' in data) {
        const levelValue = data.levelId;
        delete data.levelId;
        data.level = levelValue ? { connect: { id: levelValue } } : { disconnect: true };
      }
      const relations = ['venueId', 'surfaceId', 'tournamentCategoryId', 'tournamentTypeId'] as const;
      for (const relation of relations) {
        if (!(relation in data)) continue;
        const value = data[relation];
        delete data[relation];
        if (value) data[relation.replace('Id', '')] = { connect: { id: value } };
      }
    }
    if (resource === 'matches') {
      const relations = ['tournamentId', 'player1Id', 'player2Id', 'winnerId'] as const;
      for (const relation of relations) {
        const value = data[relation];
        delete data[relation];
        if (value) data[relation.replace('Id', '')] = { connect: { id: value } };
      }
    }
    const updated = await (prisma as any)[modelName].update({
      where: { id },
      data,
      ...(resource === 'players' ? { include: { user: { select: { id: true, email: true, role: true, isActive: true } } } } : {})
    });
    return NextResponse.json({ data: updated, message: 'Registro actualizado correctamente' });
  } catch (error) {
    if (error instanceof DrawError) return NextResponse.json({ message: error.message }, { status: error.status });
    logger.warn('admin.update_failed', { err: error, resource, id });
    return NextResponse.json({ message: error instanceof Error ? error.message : 'No se pudo actualizar el registro' }, { status: 400 });
  }
}

async function archiveRecord(_request: NextRequest, context: Context) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { resource, id } = await context.params;
  const modelName = models[resource as keyof typeof models];
  if (!modelName) return NextResponse.json({ message: 'Recurso inválido' }, { status: 404 });

  try {
    if (resource === 'matches') {
      const linked = await prisma.match.findFirst({
        where: { id, deletedAt: null },
        include: { drawMatch: { select: { id: true } }, tournament: { select: { status: true } } },
      });
      if (linked?.drawMatch) {
        if (linked.tournament?.status !== 'IN_PROGRESS') {
          return NextResponse.json({ message: 'No se puede archivar un partido de un torneo finalizado: corregí su resultado' }, { status: 409 });
        }
        await prisma.$transaction(async (tx) => {
          await tx.match.update({ where: { id }, data: { deletedAt: new Date() } });
          await unlinkDrawResult(tx, linked.drawMatch!.id);
        });
        return NextResponse.json({ message: 'Resultado archivado. El partido volvió a estar pendiente en el cuadro' });
      }
    }
    if (resource === 'users') {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true, player: { select: { id: true } } } });
      if (target?.role === 'ADMIN' && target.isActive && await prisma.user.count({ where: { role: 'ADMIN', isActive: true, deletedAt: null } }) <= 1) {
        return NextResponse.json({ message: 'No se puede archivar el último administrador activo' }, { status: 409 });
      }
      if (target?.player) {
        await prisma.player.update({ where: { id: target.player.id }, data: { userId: null } });
      }
    }
    if (resource === 'players') {
      await prisma.player.update({ where: { id }, data: { userId: null } });
    }
    await (prisma as any)[modelName].update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ message: 'Registro archivado correctamente' });
  } catch (error) {
    if (error instanceof DrawError) return NextResponse.json({ message: error.message }, { status: error.status });
    logger.warn('admin.archive_failed', { err: error, resource, id });
    return NextResponse.json({ message: 'No se pudo archivar el registro' }, { status: 400 });
  }
}

async function patchHandler(request: NextRequest, context: Context) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { resource, id } = await context.params;
  const modelName = models[resource as keyof typeof models];
  if (!modelName) return updateRecord(request, context);

  const body = await request.clone().json().catch(() => ({}));
  const before = await snapshotRecord(modelName, id);
  const result = await updateRecord(request, context);
  if (result.ok) {
    await auditAdminMutation({
      action: auditActionFor(resource, body?.action),
      modelName,
      entityId: id,
      actor: actorFromSession(session),
      before,
      after: await snapshotRecord(modelName, id),
      metadata: body?.password ? { pwChanged: true } : undefined,
    });
  }
  return result;
}

async function deleteHandler(request: NextRequest, context: Context) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { resource, id } = await context.params;
  const modelName = models[resource as keyof typeof models];
  if (!modelName) return archiveRecord(request, context);

  const before = await snapshotRecord(modelName, id);
  const result = await archiveRecord(request, context);
  if (result.ok) {
    await auditAdminMutation({ action: 'DELETE', modelName, entityId: id, actor: actorFromSession(session), before, metadata: { softDelete: true } });
  }
  return result;
}

export const PATCH = withApiLogging('/api/admin/[resource]/[id]', patchHandler);
export const DELETE = withApiLogging('/api/admin/[resource]/[id]', deleteHandler);
