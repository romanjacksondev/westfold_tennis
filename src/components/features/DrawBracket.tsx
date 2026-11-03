'use client';

import { LuTrophy } from 'react-icons/lu';

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
  source1?: { type: string; position: number } | null;
  source2?: { type: string; position: number } | null;
  player1: DrawPlayer;
  player2: DrawPlayer;
  matchId: string | null;
  winnerId: string | null;
  walkover?: boolean;
  score: string[];
  sets?: { g1: number; g2: number; tiebreak: boolean; tb1: number | null; tb2: number | null }[];
};
export type SlotRef = { drawMatchId: string; slot: 1 | 2 };

const stageLabels: Record<string, string> = {
  ROUND_OF_32: '16avos de final',
  ROUND_OF_16: 'Octavos de final',
  QUARTERFINAL: 'Cuartos de final',
  SEMIFINAL: 'Semifinales',
  FINAL: 'Final',
};

type Props = {
  matches: DrawNode[];
  selected?: SlotRef | null;
  onSlotClick?: (ref: SlotRef) => void;
  swappable?: (node: DrawNode) => boolean;
  onMatchClick?: (node: DrawNode) => void;
  championId?: string | null;
  standings?: DrawStanding[];
};

export type DrawStanding = {
  id: string;
  name: string;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
};

function StandingsTable({ standings, championId }: { standings: DrawStanding[]; championId?: string | null }) {
  const champion = standings.find((row) => row.id === championId);
  return (
    <div className="draw-standings">
      {champion && (
        <div className="draw-standings-champion" data-testid="rr-champion">
          <LuTrophy className="w-6 h-6 text-[#b38600]" /> <span>Campeón: <strong>{champion.name}</strong></span>
        </div>
      )}
      <p className="eyebrow">Tabla de posiciones</p>
      <div className="tournament-detail-table-wrap">
        <table className="tournament-detail-table" data-testid="rr-standings">
          <thead>
            <tr><th>#</th><th>Jugador</th><th>PJ</th><th>PG</th><th>PP</th><th>Sets</th><th>Games</th></tr>
          </thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.id} className={row.id === championId ? 'is-champion' : undefined}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.matchesWon + row.matchesLost}</td>
                <td>{row.matchesWon}</td>
                <td>{row.matchesLost}</td>
                <td>{row.setsWon}-{row.setsLost}</td>
                <td>{row.gamesWon}-{row.gamesLost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const tag = (round: number, position: number) => (round === 1 ? `Partido ${position + 1}` : `Partido R${round}-${position + 1}`);
const shortTag = (round: number, position: number) => (round === 1 ? `${position + 1}` : `R${round}-${position + 1}`);

function slotLabel(node: DrawNode, slot: 1 | 2, nodes: DrawNode[]) {
  const player = slot === 1 ? node.player1 : node.player2;
  const seed = slot === 1 ? node.seed1 : node.seed2;
  if (player) return { text: `${seed ? `(${seed}) ` : ''}${player.name ?? player.id}`, placeholder: false, bye: false };
  if (node.isBye) return { text: 'BYE', placeholder: false, bye: true };
  const source = slot === 1 ? node.source1 : node.source2;
  if (source?.type === 'GROUP_POSITION') return { text: `${source.position}º de la tabla`, placeholder: true, bye: false };
  if (node.round > 1) {
    const feeder = nodes.find((n) => n.phase === 'PLAYOFF' && n.round === node.round - 1 && n.position === node.position * 2 + (slot - 1));
    if (feeder) return { text: `Ganador Partido ${shortTag(feeder.round, feeder.position)}`, placeholder: true, bye: false };
  }
  return { text: 'Por definir', placeholder: true, bye: false };
}

const isPlayable = (node: DrawNode) => !node.isBye && Boolean(node.player1 && node.player2);

const keyboardClick = (handler: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handler();
  }
};

function ScoreLine({ node }: { node: DrawNode }) {
  if (!node.matchId) return null;
  return (
    <div className="draw-match-result">
      {node.walkover && <span className="draw-wo-pill">W.O.</span>}
      {node.score.length > 0 && <span>{node.score.join('  ')}</span>}
    </div>
  );
}

function PlayoffRounds({ nodes, all, props }: { nodes: DrawNode[]; all: DrawNode[]; props: Props }) {
  const { selected, onSlotClick, swappable, onMatchClick, championId } = props;
  const rounds = [...new Set(nodes.map((n) => n.round))].sort((a, b) => a - b).map((round) => ({ round, nodes: nodes.filter((n) => n.round === round) }));
  const final = nodes.find((n) => n.stage === 'FINAL');
  const champion = final?.winnerId ? [final.player1, final.player2].find((p) => p?.id === final.winnerId) : championId ? { id: championId, name: null } : null;

  return (
    <div className="draw-bracket-viewport">
      <div className="draw-rounds">
        {rounds.map(({ round, nodes: roundNodes }) => (
          <div key={round} className="draw-round">
            <div className="draw-round-title">
              {stageLabels[roundNodes[0].stage ?? ''] ?? `Ronda ${round}`}
              <span className="draw-round-count">{roundNodes.length} {roundNodes.length === 1 ? 'partido' : 'partidos'}</span>
            </div>
            <div className="draw-round-matches">
              {roundNodes.map((node) => {
                const clickable = Boolean(onMatchClick && isPlayable(node));
                const open = () => onMatchClick?.(node);
                return (
                  <div
                    key={node.id}
                    className={`draw-match-card${clickable ? ' is-clickable' : ''}${node.matchId ? ' is-played' : ''}`}
                    data-testid="draw-slot"
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={clickable ? `${tag(node.round, node.position)}: ${node.player1?.name} vs ${node.player2?.name}` : undefined}
                    onClick={clickable ? open : undefined}
                    onKeyDown={clickable ? keyboardClick(open) : undefined}
                  >
                    <div className="draw-match-header-tag">{tag(node.round, node.position)}</div>
                    {([1, 2] as const).map((slot) => {
                      const label = slotLabel(node, slot, all);
                      const player = slot === 1 ? node.player1 : node.player2;
                      const swapOn = Boolean(onSlotClick && player && swappable?.(node));
                      const isSelected = selected?.drawMatchId === node.id && selected.slot === slot;
                      return (
                        <div
                          key={slot}
                          className={`draw-match-slot${label.bye ? ' is-vacancy' : ''}${label.placeholder ? ' is-placeholder' : ''}${player && node.winnerId === player.id ? ' is-winner' : ''}${isSelected ? ' is-selected' : ''}${swapOn ? ' is-swappable' : ''}`}
                          onClick={swapOn ? () => onSlotClick?.({ drawMatchId: node.id, slot }) : undefined}
                        >
                          <span className="draw-slot-num">{slot}</span>
                          <span className="draw-slot-label">{label.text}</span>
                          {label.bye && <span className="draw-bye-pill" title="El BYE no es un partido ni otorga puntos por victoria.">BYE</span>}
                        </div>
                      );
                    })}
                    <ScoreLine node={node} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="draw-round draw-round-champion">
          <div className="draw-round-title" style={{ color: '#b38600' }}>🏆 CAMPEÓN</div>
          <div className="draw-champion-podium">
            <div className="draw-champion-trophy"><LuTrophy className="w-12 h-12 text-[#b38600]" /></div>
            <strong className="draw-champion-title">{champion?.name ?? (champion ? 'Campeón' : 'Ganador de la Gran Final')}</strong>
            {!champion && <span className="text-xs text-gray-500 text-center mt-1">Consagración del torneo</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupRounds({ nodes, props }: { nodes: DrawNode[]; props: Props }) {
  const { onMatchClick } = props;
  const rounds = [...new Set(nodes.map((n) => n.round))].sort((a, b) => a - b);
  return (
    <div className="draw-rr-grid">
      {rounds.map((round) => {
        const roundNodes = nodes.filter((n) => n.round === round);
        return (
          <div key={round} className="draw-rr-round-card">
            <div className="draw-rr-round-header">
              <strong>Fecha {round}</strong>
              <span className="text-xs text-gray-500">{roundNodes.length} enfrentamientos</span>
            </div>
            <div className="draw-rr-matches-list">
              {roundNodes.map((node) => {
                const clickable = Boolean(onMatchClick && isPlayable(node));
                const open = () => onMatchClick?.(node);
                return (
                  <div
                    key={node.id}
                    className={`draw-rr-match-row${node.isBye ? ' is-bye' : ''}${clickable ? ' is-clickable' : ''}`}
                    data-testid="draw-slot"
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={clickable ? `${node.player1?.name} vs ${node.player2?.name}` : undefined}
                    onClick={clickable ? open : undefined}
                    onKeyDown={clickable ? keyboardClick(open) : undefined}
                  >
                    <span className={`draw-rr-player-a${node.winnerId && node.winnerId === node.player1?.id ? ' is-winner' : ''}`}>{node.player1?.name ?? 'Vacante'}</span>
                    <span className="draw-rr-vs-badge">{node.matchId ? (node.walkover ? 'W.O.' : node.score.join(' ') || 'VS') : 'VS'}</span>
                    <span className={`draw-rr-player-b${node.winnerId && node.winnerId === node.player2?.id ? ' is-winner' : ''}`}>{node.player2?.name ?? 'Vacante'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DrawBracket(props: Props) {
  const { matches } = props;
  if (matches.length === 0) return <p className="muted">Todavía no hay cuadro.</p>;
  const group = matches.filter((n) => n.phase === 'GROUP');
  const playoff = matches.filter((n) => n.phase === 'PLAYOFF');

  return (
    <div className="draw-mixed-container">
      {group.length > 0 && (
        <div className="draw-rr-container">
          {playoff.length > 0 && <p className="eyebrow">Fase regular</p>}
          <GroupRounds nodes={group} props={props} />
          {props.standings && props.standings.length > 0 && (
            <StandingsTable standings={props.standings} championId={playoff.length === 0 ? props.championId : null} />
          )}
        </div>
      )}
      {playoff.length > 0 && (
        <div>
          {group.length > 0 && <p className="eyebrow" style={{ marginBottom: 8 }}>Fase de definición</p>}
          <PlayoffRounds nodes={playoff} all={matches} props={props} />
        </div>
      )}
    </div>
  );
}
