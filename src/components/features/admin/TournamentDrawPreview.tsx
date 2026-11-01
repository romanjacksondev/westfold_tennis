'use client';

import {
  buildTournamentDrawPreview,
  getDrawRoundTitle,
  type PreviewSlot,
} from '@/utils/tournament-draw-preview';

type Props = {
  typeName: string;
  drawSize: number;
  qualifiers: number;
  playerNames: string[];
};

function Matrix({ slots }: { slots: PreviewSlot[] }) {
  return (
    <div className="draw-preview-scroll">
      <table className="tournament-detail-table bracket-matrix">
        <thead>
          <tr>
            <th />
            {slots.map((slot, i) => (
              <th
                key={i}
                className={slot.filled ? undefined : 'draw-slot-empty'}
                title={slot.label}
              >
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((row, i) => (
            <tr key={i}>
              <th className={row.filled ? undefined : 'draw-slot-empty'}>
                {i + 1}. {row.label}
              </th>
              {slots.map((_, j) => (
                <td key={j} className={i === j ? 'matrix-self' : 'matrix-empty'}>
                  {i === j ? '—' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Single elimination bracket: seed i meets seed size-1-i, later rounds are placeholders. */
function Bracket({ slots, size }: { slots: PreviewSlot[]; size: number }) {
  const firstRound: [PreviewSlot, PreviewSlot][] = [];
  for (let i = 0; i < size / 2; i++) firstRound.push([slots[i], slots[size - 1 - i]]);

  const rounds: { title: string; matches: [string, string][] }[] = [];
  let matchPlayers = size;
  let matchCount = size / 2;
  while (matchPlayers >= 2) {
    if (matchPlayers === size) {
      rounds.push({ title: getDrawRoundTitle(matchPlayers), matches: [] });
    } else {
      rounds.push({
        title: getDrawRoundTitle(matchPlayers),
        matches: Array.from({ length: matchCount }, (_, i) => [
          `Ganador P${i * 2 + 1}`,
          `Ganador P${i * 2 + 2}`,
        ]),
      });
    }
    matchPlayers /= 2;
    matchCount /= 2;
  }

  return (
    <div className="bracket-rounds">
      <div className="bracket-round">
        <p className="bracket-round-title">{getDrawRoundTitle(size)}</p>
        <div className="bracket-round-matches">
          {firstRound.map(([a, b], i) => (
            <div key={i} className="bracket-match">
              {[a, b].map((slot, j) => (
                <div key={j} className={`bracket-player${slot.filled ? '' : ' draw-slot-empty'}`}>
                  <span>{slot.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {rounds.slice(1).map((round) => (
        <div key={round.title} className="bracket-round">
          <p className="bracket-round-title">{round.title}</p>
          <div className="bracket-round-matches">
            {round.matches.map(([a, b], i) => (
              <div key={i} className="bracket-match">
                <div className="bracket-player draw-slot-empty">
                  <span>{a}</span>
                </div>
                <div className="bracket-player draw-slot-empty">
                  <span>{b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Draw preview that fills in as players are confirmed. Uses the order of confirmation as seeding. */
export default function TournamentDrawPreview({
  typeName,
  drawSize,
  qualifiers,
  playerNames,
}: Props) {
  const preview = buildTournamentDrawPreview({ typeName, drawSize, qualifiers, playerNames });
  if (preview.kind === 'unsupported') {
    return <p className="prep-box-empty">Elegí un formato de torneo para ver el cuadro.</p>;
  }
  if (preview.kind === 'invalid-size') {
    return <p className="prep-box-empty">Indicá el tamaño del cuadro para ver el cuadro.</p>;
  }
  if (preview.kind === 'too-large') {
    return (
      <p className="prep-box-empty">
        La vista previa del cuadro admite hasta {preview.maxSlots} cupos.
      </p>
    );
  }

  if (preview.kind === 'round-robin' || preview.kind === 'mixed') {
    return (
      <div className="draw-preview">
        <div>
          <p className="prep-box-label">Todos contra todos · {preview.matchCount} partidos</p>
          <Matrix slots={preview.slots} />
        </div>
        {preview.kind === 'mixed' &&
          preview.bracketSlots &&
          preview.bracketSize &&
          preview.qualifierCount && (
            <div>
              <p className="prep-box-label">Playoffs · clasifican {preview.qualifierCount}</p>
              <Bracket slots={preview.bracketSlots} size={preview.bracketSize} />
            </div>
          )}
      </div>
    );
  }

  if (preview.kind !== 'playoffs') return null;

  return (
    <div className="draw-preview">
      <Bracket slots={preview.bracketSlots} size={preview.bracketSize} />
    </div>
  );
}
