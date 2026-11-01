export type PreviewSlot = { label: string; filled: boolean };

export type TournamentDrawPreview =
  | { kind: 'unsupported' }
  | { kind: 'invalid-size' }
  | { kind: 'too-large'; maxSlots: number }
  | {
      kind: 'round-robin' | 'mixed';
      slots: PreviewSlot[];
      matchCount: number;
      qualifierCount?: number;
      bracketSlots?: PreviewSlot[];
      bracketSize?: number;
    }
  | {
      kind: 'playoffs';
      slots: PreviewSlot[];
      bracketSlots: PreviewSlot[];
      bracketSize: number;
      matchCount: number;
    };

export const MAX_PREVIEW_SLOTS = 32;

export function nextPowerOfTwo(value: number): number {
  let size = 2;
  while (size < value) size *= 2;
  return size;
}

export function getDrawRoundTitle(matchPlayers: number): string {
  const titles: Record<number, string> = {
    2: 'Final',
    4: 'Semifinal',
    8: 'Cuartos de final',
    16: 'Octavos de final',
    32: '16avos de final',
  };
  return titles[matchPlayers] ?? `Ronda de ${matchPlayers}`;
}

export function buildTournamentDrawPreview({
  typeName,
  drawSize,
  qualifiers,
  playerNames,
}: {
  typeName: string;
  drawSize: number;
  qualifiers: number;
  playerNames: string[];
}): TournamentDrawPreview {
  const kind = typeName.trim().toLowerCase();
  const isMixed = kind === 'round robin + playoffs';
  const isRoundRobin = kind === 'round robin';
  const isPlayoffs = kind === 'playoffs';

  if (!isMixed && !isRoundRobin && !isPlayoffs) return { kind: 'unsupported' };
  if (drawSize < 2) return { kind: 'invalid-size' };
  if (drawSize > MAX_PREVIEW_SLOTS) return { kind: 'too-large', maxSlots: MAX_PREVIEW_SLOTS };

  const slotCount = Math.max(drawSize, playerNames.length);
  const slots = Array.from({ length: slotCount }, (_, index) =>
    playerNames[index]
      ? { label: playerNames[index], filled: true }
      : { label: 'Cupo libre', filled: false },
  );

  if (isRoundRobin || isMixed) {
    const preview: Extract<TournamentDrawPreview, { kind: 'round-robin' | 'mixed' }> = {
      kind: isMixed ? 'mixed' : 'round-robin',
      slots,
      matchCount: (slotCount * (slotCount - 1)) / 2,
    };
    if (isMixed) {
      const qualifierCount = Math.min(Math.max(Math.floor(qualifiers) || 2, 2), slotCount);
      const bracketSize = nextPowerOfTwo(qualifierCount);
      preview.qualifierCount = qualifierCount;
      preview.bracketSize = bracketSize;
      preview.bracketSlots = Array.from({ length: bracketSize }, (_, index) =>
        index < qualifierCount
          ? { label: `${index + 1}º de grupos`, filled: false }
          : { label: 'BYE', filled: false },
      );
    }
    return preview;
  }

  const bracketSize = nextPowerOfTwo(slotCount);
  const bracketSlots = Array.from({ length: bracketSize }, (_, index) =>
    index < slotCount ? slots[index] : { label: 'BYE', filled: false },
  );
  return {
    kind: 'playoffs',
    slots,
    bracketSlots,
    bracketSize,
    matchCount: Math.max(slotCount - 1, 0),
  };
}
