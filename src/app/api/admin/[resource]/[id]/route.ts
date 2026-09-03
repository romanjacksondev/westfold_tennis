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

type Context = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { resource, id } = await context.params;
  const modelName = models[resource as keyof typeof models];
  if (!modelName) return NextResponse.json({ message: 'Recurso inválido' }, { status: 404 });

  try {
    const body = await request.json();
    const data = { ...body };
    delete data.id;
    delete data.deletedAt;
    if (resource === 'users') {
      const current = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
      if (current?.role === 'ADMIN' && current.isActive && (data.role === 'USER' || data.isActive === false)) {
        const activeAdmins = await prisma.user.count({ where: { role: 'ADMIN', isActive: true, deletedAt: null } });
        if (activeAdmins <= 1) return NextResponse.json({ message: 'No se puede quitar acceso al último administrador activo' }, { status: 409 });
      }
      if (data.email) data.email = String(data.email).trim().toLowerCase();
      if (data.password) data.password = await bcrypt.hash(String(data.password), 12);
      else delete data.password;
      if (data.role && !['USER', 'ADMIN'].includes(data.role)) throw new Error('Rol inválido');
      if (data.playerId) {
        data.player = { connect: { id: data.playerId } };
        delete data.playerId;
      }
      const updated = await (prisma as any)[modelName].update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, isActive: true } });
      return NextResponse.json({ data: updated, message: 'Usuario actualizado correctamente' });
    }
    if (data.date) data.date = new Date(data.date);
    if (resource === 'tournaments') {
      const relations = ['venueId', 'surfaceId', 'championId', 'tournamentCategoryId', 'tournamentTypeId'] as const;
      for (const relation of relations) {
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
    const updated = await (prisma as any)[modelName].update({ where: { id }, data });
    return NextResponse.json({ data: updated, message: 'Registro actualizado correctamente' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'No se pudo actualizar el registro' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { resource, id } = await context.params;
  const modelName = models[resource as keyof typeof models];
  if (!modelName) return NextResponse.json({ message: 'Recurso inválido' }, { status: 404 });

  try {
    if (resource === 'users') {
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
      if (target?.role === 'ADMIN' && target.isActive && await prisma.user.count({ where: { role: 'ADMIN', isActive: true, deletedAt: null } }) <= 1) {
        return NextResponse.json({ message: 'No se puede archivar el último administrador activo' }, { status: 409 });
      }
    }
    await (prisma as any)[modelName].update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ message: 'Registro archivado correctamente' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'No se pudo archivar el registro' }, { status: 400 });
  }
}
