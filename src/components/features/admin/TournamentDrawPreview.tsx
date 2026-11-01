'use client';

import {
  buildTournamentDrawPreview,
  getDrawRoundTitle,
  type PreviewSlot,
} from '@/utils/tournament-draw-preview';
import { buildEliminationBracket, type DrawSlot } from '@/utils/utils';

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

function isVacant(slot: DrawSlot) {
  return slot.id === null && ['BYE', 'Vacante', 'Cupo libre'].includes(slot.label);
}

function isParticipant(slot: DrawSlot) {
  return (
    slot.id !== null ||
    slot.advancedByBye === true ||
    (!isVacant(slot) && !slot.label.startsWith('Ganador Partido'))
  );
}

function displayLabel(slot: DrawSlot, opponent: DrawSlot) {
  if (isVacant(slot) && isParticipant(opponent)) return 'BYE';
  return slot.label.replace(/^Ganador Partido /, 'Ganador P');
}

function Bracket({ slots, size }: { slots: PreviewSlot[]; size: number }) {
  const drawSlots: DrawSlot[] = slots.map((slot, index) => ({
    id: slot.filled ? `preview-${index}` : null,
    label: slot.label,
  }));
  const rounds = buildEliminationBracket(drawSlots);

  return (
    <div className="bracket-rounds">
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="bracket-round">
          <p className="bracket-round-title">{getDrawRoundTitle(size / 2 ** roundIndex)}</p>
          <div className="bracket-round-matches">
            {round.matches.map(({ top, bottom }, i) => {
              const sides = [top, bottom];
              return (
                <div key={i} className="bracket-match">
                  {sides.map((slot, j) => (
                    <div
                      key={j}
                      className={`bracket-player${isParticipant(slot) ? '' : ' draw-slot-empty'}`}
                    >
                      <span>
                        {displayLabel(slot, sides[1 - j])}
                        {slot.advancedByBye && (
                          <small className="bracket-bye-note">
                            Pase directo por BYE · sin puntos por victoria
                          </small>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
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
      <div className="tournament-draw-preview">
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
    <div className="tournament-draw-preview">
      <Bracket slots={preview.bracketSlots} size={preview.bracketSize} />
    </div>
  );
}
