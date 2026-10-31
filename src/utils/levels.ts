// Pure level rules: keep this file import-free so `node --test` can load it.

export type LevelRef = { id: string; name: string; order: number };

// A played match, oldest to newest, with the opponent's declared level order (null when unknown).
export type RatedMatch = { won: boolean; opponentOrder: number | null };

export type LevelSuggestion = {
  levelId: string;
  direction: 'up' | 'down' | 'initial';
  streak: number;
};

export const SUGGESTION_STREAK = 5;

const sortLevels = (levels: LevelRef[]) => [...levels].sort((a, b) => a.order - b.order);

/**
 * Suggests a level from recent results. The declared level is only a reference, so this is advisory:
 * - up: SUGGESTION_STREAK wins in a row against same-or-higher level opponents -> next level up.
 *   Wins against lower levels and matches against unrated opponents neither count nor break the streak; a loss breaks it.
 * - down: the mirror case with losses against same-or-lower level opponents -> next level down.
 * - initial: a player without level gets the most common opponent level (the higher one on ties) once enough rated matches exist.
 */
export function suggestLevel(
  currentLevelId: string | null | undefined,
  matches: RatedMatch[],
  levels: LevelRef[],
  streak = SUGGESTION_STREAK,
): LevelSuggestion | null {
  const ordered = sortLevels(levels);
  const rated = matches.filter((match) => match.opponentOrder !== null) as { won: boolean; opponentOrder: number }[];
  const current = ordered.find((level) => level.id === currentLevelId);

  if (!current) {
    const recent = rated.slice(-streak);
    if (recent.length < streak) return null;
    const counts = new Map<number, number>();
    for (const match of recent) counts.set(match.opponentOrder, (counts.get(match.opponentOrder) ?? 0) + 1);
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
    const level = ordered.find((item) => item.order === best);
    return level ? { levelId: level.id, direction: 'initial', streak: recent.length } : null;
  }

  const countStreak = (wantWin: boolean) => {
    let count = 0;
    for (let i = rated.length - 1; i >= 0; i--) {
      const match = rated[i];
      if (match.won !== wantWin) break;
      const counts = wantWin ? match.opponentOrder >= current.order : match.opponentOrder <= current.order;
      if (counts) count++;
    }
    return count;
  };

  const index = ordered.indexOf(current);
  const up = countStreak(true);
  if (up >= streak && ordered[index + 1]) return { levelId: ordered[index + 1].id, direction: 'up', streak: up };
  const down = countStreak(false);
  if (down >= streak && ordered[index - 1]) return { levelId: ordered[index - 1].id, direction: 'down', streak: down };
  return null;
}

/** How far a player's declared level is from the tournament's: >0 plays up, <0 plays down. Null when either is unknown. */
export function levelGap(playerOrder: number | null | undefined, tournamentOrder: number | null | undefined): number | null {
  if (playerOrder == null || tournamentOrder == null) return null;
  return tournamentOrder - playerOrder;
}

export function describeLevelGap(gap: number | null): string | null {
  if (gap === null || gap === 0) return null;
  const steps = Math.abs(gap);
  const unit = steps === 1 ? 'nivel' : 'niveles';
  return gap > 0 ? `Juega ${steps} ${unit} arriba` : `Juega ${steps} ${unit} abajo`;
}
