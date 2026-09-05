import { prisma } from '@/utils/prisma';
import { requireAdmin } from '@/lib/require-session';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const models = {
  players: 'player',
  venues: 'venue',
  surfaces: 'surface',
  'tournament-types': 'tournamentType',
  'tournament-categories': 'tournamentCategory',
  tournaments: 'tournament',
  matches: 'match',
  users: 'user',
} as const;

type Resource = keyof typeof models;
type Context = { params: Promise<{ resource: string }> };

function getResource(resource: string) {
  return resource in models ? (resource as Resource) : null;
}

function errorResponse(error: unknown) {
  console.error(error);
  return NextResponse.json({ message: 'No se pudo completar la solicitud' }, { status: 400 });
}

export async function GET(_request: NextRequest, context: Context) {
  const { response } = await requireAdmin();
  if (response) return response;

  const resource = getResource((await context.params).resource);
  if (!resource) return NextResponse.json({ message: 'Recurso inválido' }, { status: 404 });
  try {
    const model = (prisma as any)[models[resource]];
    const include = resource === 'tournaments'
      ? { venue: { select: { name: true } }, surface: { select: { name: true } }, champion: { select: { name: true } }, tournamentCategory: { select: { name: true } }, tournamentType: { select: { name: true } }, players: { select: { id: true, name: true } } }
      : resource === 'matches'
        ? { player1: { select: { name: true } }, player2: { select: { name: true } }, winner: { select: { name: true } }, sets: { include: { games: true } } }
        : undefined;
    const data = resource === 'users'
      ? await model.findMany({ where: { deletedAt: null }, orderBy: { email: 'asc' }, select: { id: true, name: true, email: true, role: true, isActive: true, player: { select: { id: true, name: true } } } })
      : await model.findMany({ where: { deletedAt: null }, ...(resource === 'tournaments' ? { orderBy: { date: 'desc' } } : resource === 'matches' ? {} : { orderBy: { name: 'asc' } }), ...(include ? { include } : {}) });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  const { response } = await requireAdmin();
  if (response) return response;

  const resource = getResource((await context.params).resource);
  if (!resource) return NextResponse.json({ message: 'Recurso inválido' }, { status: 404 });
  const model = (prisma as any)[models[resource]];

  try {
    const body = await request.json();
    const data = { ...body };
    delete data.id;
    delete data.deletedAt;

    if (resource === 'users') {
      const email = String(data.email ?? '').trim().toLowerCase();
      const password = String(data.password ?? '');
      if (!email || password.length < 12) throw new Error('Email y contraseña de al menos 12 caracteres son obligatorios');
      if (!['USER', 'ADMIN'].includes(data.role)) throw new Error('Rol inválido');
      const playerId = data.playerId;
      const created = await model.create({ data: { name: data.name?.trim() || null, email, role: data.role, isActive: data.isActive !== false, password: await bcrypt.hash(password, 12), player: playerId ? { connect: { id: playerId } } : undefined }, select: { id: true, name: true, email: true, role: true, isActive: true, player: { select: { id: true, name: true } } } });
      return NextResponse.json({ data: created, message: 'Usuario creado correctamente' }, { status: 201 });
    }

    if (resource === 'tournaments') {
      const { venueId, surfaceId, championId, tournamentCategoryId, tournamentTypeId, playerIds, drawSize, qualifiers, date, role, status, finishedAt, createdAt, ...fields } = data;
      Object.assign(data, {
        ...fields,
        date: date ? new Date(date) : new Date(),
        status: 'IN_PROGRESS',
        finishedAt: null,
        drawSize: drawSize !== undefined && drawSize !== '' ? Number(drawSize) : null,
        qualifiers: qualifiers !== undefined && qualifiers !== '' ? Number(qualifiers) : null,
        venue: { connect: { id: venueId } },
        surface: { connect: { id: surfaceId } },
        champion: championId ? { connect: { id: championId } } : undefined,
        tournamentCategory: { connect: { id: tournamentCategoryId } },
        tournamentType: tournamentTypeId ? { connect: { id: tournamentTypeId } } : undefined,
        players: Array.isArray(playerIds) ? { connect: playerIds.map((id: string) => ({ id })) } : undefined,
      });
      delete data.venueId;
      delete data.surfaceId;
      delete data.championId;
      delete data.tournamentCategoryId;
      delete data.tournamentTypeId;
      delete data.playerIds;
      delete data.drawSize;
      delete data.qualifiers;
      delete data.role;
    }

    if (resource === 'matches') {
      const { tournamentId, player1Id, player2Id, winnerId } = data;
      if (!tournamentId || !player1Id || !player2Id || !winnerId) throw new Error('Faltan datos del partido');
      Object.assign(data, {
        tournament: { connect: { id: tournamentId } },
        player1: { connect: { id: player1Id } },
        player2: { connect: { id: player2Id } },
        winner: { connect: { id: winnerId } },
      });
      delete data.tournamentId;
      delete data.player1Id;
      delete data.player2Id;
      delete data.winnerId;
    }

    const created = await (prisma as any)[models[resource]].create({ data });
    return NextResponse.json({ data: created, message: 'Registro creado correctamente' }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
