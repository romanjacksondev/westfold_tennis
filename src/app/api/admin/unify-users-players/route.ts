import { prisma } from '@/utils/prisma';
import { requireAdmin } from '@/lib/require-session';
import { NextResponse } from 'next/server';

export async function POST() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    // Find unlinked players that have an email configured
    const unlinkedPlayers = await prisma.player.findMany({
      where: {
        deletedAt: null,
        userId: null,
        mail: { not: null },
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        nickname: true,
        mail: true,
      },
    });

    // Find unlinked users
    const unlinkedUsers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        player: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Build map of normalized email -> user
    const userByEmail = new Map<string, typeof unlinkedUsers[number]>();
    for (const user of unlinkedUsers) {
      if (user.email) {
        userByEmail.set(user.email.trim().toLowerCase(), user);
      }
    }

    const matched: Array<{
      playerId: string;
      playerName: string;
      userEmail: string;
      userId: string;
    }> = [];

    // Perform unification in transaction
    await prisma.$transaction(async (tx) => {
      for (const player of unlinkedPlayers) {
        if (!player.mail) continue;
        const normalizedMail = player.mail.trim().toLowerCase();
        const matchedUser = userByEmail.get(normalizedMail);

        if (matchedUser) {
          await tx.player.update({
            where: { id: player.id },
            data: { userId: matchedUser.id },
          });

          userByEmail.delete(normalizedMail); // avoid re-linking if duplicate mails exist
          matched.push({
            playerId: player.id,
            playerName: `${player.name}${player.lastname ? ` ${player.lastname}` : ''}`,
            userEmail: matchedUser.email,
            userId: matchedUser.id,
          });
        }
      }
    });

    const count = matched.length;
    const message =
      count === 0
        ? 'No se encontraron coincidencias pendientes de email entre jugadores y usuarios.'
        : `Se unificaron exitosamente ${count} jugador(es) y usuario(s) por coincidencia de email.`;

    return NextResponse.json({
      message,
      count,
      matched,
    });
  } catch (error) {
    console.error('Error al auto-unificar jugadores y usuarios:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al procesar la unificación' },
      { status: 500 }
    );
  }
}

