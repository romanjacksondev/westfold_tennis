'use client';

export type DrawPlayer = { id: string; name: string | null } | null;
export type DrawNode = {
  id: string;
  phase: 'GROUP' | 'PLAYOFF';
  round: number;
  position: number;
  stage: string | null;
  isBye: boolean;
  seed1: number | null;
  seed2: number | null;
  player1: DrawPlayer;
  player2: DrawPlayer;
  matchId: string | null;
  winnerId: string | null;
  score: string[];
};
export type SlotRef = { drawMatchId: string; slot: 1 | 2 };

const stageLabels: Record<string, string> = {
  GROUP: 'Fase de grupos',
  ROUND_OF_32: '16avos de final',
  ROUND_OF_16: 'Octavos de final',
  QUARTERFINAL: 'Cuartos de final',
  SEMIFINAL: 'Semifinal',
  FINAL: 'Final',
};

type Props = {
  matches: DrawNode[];
  selected?: SlotRef | null;
  onSlotClick?: (ref: SlotRef) => void;
  swappable?: (node: DrawNode) => boolean;
};

function groupByRound(matches: DrawNode[]) {
  const rounds = new Map<string, DrawNode[]>();
  for (const node of matches) {
    const key = `${node.phase}:${node.round}`;
    rounds.set(key, [...(rounds.get(key) ?? []), node]);
  }
  return [...rounds.entries()].map(([key, nodes]) => ({ key, nodes, title: stageLabels[nodes[0].stage ?? 'GROUP'] ?? key }));
}

export default function DrawBracket({ matches, selected, onSlotClick, swappable }: Props) {
  const rounds = groupByRound(matches);
  if (rounds.length === 0) return <p className="muted">Todavía no hay cuadro.</p>;

  return (
    <div className="draw-bracket" style={{ display: 'grid', gap: 16 }}>
      {rounds.map((round) => (
        <section key={round.key} aria-label={round.title}>
          <h4 style={{ margin: '0 0 8px' }}>{round.title}</h4>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
            {round.nodes.map((node) => (
              <article key={node.id} className="draw-slot" data-testid="draw-slot" style={{ border: '1px solid var(--border, #ddd)', borderRadius: 8, padding: 8 }}>
                {([1, 2] as const).map((slot) => {
                  const player = slot === 1 ? node.player1 : node.player2;
                  const seed = slot === 1 ? node.seed1 : node.seed2;
                  const isWinner = Boolean(player && node.winnerId === player.id);
                  const clickable = Boolean(onSlotClick && player && swappable?.(node));
                  const isSelected = selected?.drawMatchId === node.id && selected.slot === slot;
                  const label = player ? `${seed ? `(${seed}) ` : ''}${player.name ?? player.id}` : node.isBye && slot === 2 ? 'BYE' : 'Por definir';
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!clickable}
                      onClick={() => onSlotClick?.({ drawMatchId: node.id, slot })}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '4px 6px',
                        background: isSelected ? 'rgba(59,130,246,.18)' : 'transparent',
                        border: 'none',
                        fontWeight: isWinner ? 700 : 400,
                        opacity: player ? 1 : 0.55,
                        cursor: clickable ? 'pointer' : 'default',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
                {node.score.length > 0 && <small className="muted">{node.score.join('  ')}</small>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
