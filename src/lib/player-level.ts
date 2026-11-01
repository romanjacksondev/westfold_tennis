import { prisma } from '@/utils/prisma';
import { sortPlayerMatches, suggestLevel, type RatedMatch } from '@/utils/levels';

/** Declared level, advisory level suggestion and level history of a player. */
export async function getPlayerLevelInfo(playerId: string) {
  const [levels, player, matches, history] = await Promise.all([
    prisma.level.findMany({ where: { deletedAt: null }, select: { id: true, name: true, order: true } }),
    prisma.player.findUnique({ where: { id: playerId }, select: { levelId: true, level: { select: { id: true, name: true, order: true } } } }),
    prisma.match.findMany({
      where: { deletedAt: null, OR: [{ player1Id: playerId }, { player2Id: playerId }], tournament: { status: 'FINISHED', deletedAt: null } },
      select: {
        id: true,
        winnerId: true,
        stage: true,
        player1Id: true,
        player1: { select: { level: { select: { order: true } } } },
        player2: { select: { level: { select: { order: true } } } },
        tournament: { select: { date: true } },
      },
    }),
    prisma.playerLevelHistory.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, reason: true, createdAt: true, level: { select: { name: true } } },
    }),
  ]);

  const rated: RatedMatch[] = sortPlayerMatches(matches).map((match) => {
      const opponent = match.player1Id === playerId ? match.player2 : match.player1;
      return { won: match.winnerId === playerId, opponentOrder: opponent.level?.order ?? null };
    });

  const suggestion = suggestLevel(player?.levelId, rated, levels);
  const suggested = suggestion ? levels.find((level) => level.id === suggestion.levelId) : null;

  return {
    current: player?.level ?? null,
    suggestion: suggestion && suggested ? { ...suggestion, level: { id: suggested.id, name: suggested.name } } : null,
    history: history.map((item) => ({ id: item.id, level: item.level?.name ?? null, reason: item.reason, createdAt: item.createdAt.toISOString() })),
  };
}
