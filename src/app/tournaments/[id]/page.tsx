'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Fragment, Suspense, useEffect, useState } from 'react';
import { LuGitFork, LuListOrdered, LuSwords, LuTrophy } from 'react-icons/lu';
import { formatSetScore } from '@/utils/utils';
import DrawBracket, { type DrawNode } from '@/components/features/DrawBracket';
import { buildGroupMatrix, buildPlayoffRounds, getSideSetScores, sortDrawMatches } from '@/utils/draw-view';

// ─── Types ──────────────────────────────────────────────────────────────────

type MatchSet = { gamesJugador1: number; gamesJugador2: number; hasTiebreak: boolean; tiebreakPlayer1Points: number | null; tiebreakPlayer2Points: number | null };

type Match = {
  stage?: string | null;
  player1Name?: { name?: string };
  player2Name?: { name?: string };
  player1Id: string;
  player2Id: string;
  winnerId: string;
  sets?: MatchSet[];
};

type TournamentData = {
  name: string;
  champion: string;
  championGender?: 'MALE' | 'FEMALE' | null;
  type?: string | null;
  category?: string | null;
  level?: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Fase de grupos',
  ROUND_OF_32: '16avos',
  ROUND_OF_16: 'Octavos',
  QUARTERFINAL: 'Cuartos',
  SEMIFINAL: 'Semifinal',
  FINAL: 'Final',
};
const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;

type TournamentResponse = {
  tournamentData: TournamentData | null;
  playerStats: { id: string; name: string; levelNote?: string | null; matchesWon: number; matchesLost: number; setsWon: number; setsLost: number; gamesWon: number; gamesLost: number }[];
  standingsFromGroupStage?: boolean;
  matchSummary: Match[];
};

// ─── Cuadro (built from type + played matches) ──────────────────────────────

type Standing = TournamentResponse['playerStats'][number];

// Games per set for one side; the tiebreak points are shown as a superscript on the set loser's games.
function SideSets({ match, side }: { match: Match; side: 1 | 2 }) {
  return (
    <>
      {(match.sets ?? []).map((set, i) => {
        const score = getSideSetScores(set, side);
        return (
          <span key={i} className="bracket-set">
            {score.games}
            {score.hasTiebreak && score.games < score.opponentGames && score.tiebreakPoints != null && <sup>{score.tiebreakPoints}</sup>}
          </span>
        );
      })}
    </>
  );
}

function GroupMatrix({ players, matches, champion }: { players: Standing[]; matches: Match[]; champion: string | null | undefined }) {
  const rows = buildGroupMatrix(players, matches);

  return (
    <div className="tournament-detail-table-wrap">
      <table className="tournament-detail-table bracket-matrix">
        <thead>
          <tr>
            <th />
            {players.map((p) => (
              <th key={p.id}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, cells }) => (
          <tr key={player.id}>
            <th className={player.name === champion ? 'is-champion-name' : undefined}>{player.name}</th>
            {cells.map((cell, index) => {
              const opponentId = players[index].id;
              if (cell.kind === 'self') return <td key={opponentId} className="matrix-self">—</td>;
              if (cell.kind === 'empty') return <td key={opponentId} className="matrix-empty">·</td>;
              const score = cell.sets
                .map((set) => formatSetScore(set.gamesJugador1, set.gamesJugador2, set.hasTiebreak, set.tiebreakPlayer1Points, set.tiebreakPlayer2Points))
                .join('  ');
              return (
                <td key={opponentId} className={cell.won ? 'matrix-win' : 'matrix-loss'} title={cell.won ? 'Victoria' : 'Derrota'}>
                  {score}
                </td>
              );
            })}
          </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlayoffBracket({ matches }: { matches: Match[] }) {
  const rounds = buildPlayoffRounds(matches);
  return (
    <div className="bracket-rounds">
      {rounds.map(({ stage, matches: roundMatches }) => (
        <div key={stage} className="bracket-round">
          <p className="bracket-round-title">{STAGE_LABELS[stage]}</p>
          <div className="bracket-round-matches">
            {roundMatches.map((m, i) => (
                <div key={i} className="bracket-match">
                  {([1, 2] as const).map((side) => {
                    const id = side === 1 ? m.player1Id : m.player2Id;
                    const name = (side === 1 ? m.player1Name : m.player2Name)?.name ?? 'Sin nombre';
                    const won = m.winnerId === id;
                    return (
                      <div key={side} className={`bracket-player${won ? ' is-winner' : ''}`}>
                        <span>{name}</span>
                        <span className="bracket-score"><SideSets match={m} side={side} /></span>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DrawSection({ data, official }: { data: TournamentResponse; official: DrawNode[] | null }) {
  const officialPlayoffs = (official ?? []).filter((node) => node.phase === 'PLAYOFF');
  const typeName = (data.tournamentData?.type ?? '').toLowerCase();
  const groupMatches = data.matchSummary.filter((m) => !m.stage || m.stage === 'GROUP');
  const playoffMatches = data.matchSummary.filter((m) => m.stage && m.stage !== 'GROUP');
  const showGroup = groupMatches.length > 0 && (typeName.includes('round robin') || playoffMatches.length === 0 || !typeName);
  const showPlayoffs = playoffMatches.length > 0 || officialPlayoffs.length > 0;

  if (!showGroup && !showPlayoffs) return <p className="empty-state">Todavía no hay partidos jugados para armar el cuadro.</p>;

  return (
    <>
      {showGroup && (
        <section className="tournament-detail-panel">
          <p className="eyebrow">Cuadro{showPlayoffs ? ' · Fase de grupos' : ''}</p>
          <h2>Todos contra todos</h2>
          <GroupMatrix players={data.playerStats} matches={groupMatches} champion={data.tournamentData?.champion} />
        </section>
      )}
      {showPlayoffs && (
        <section className="tournament-detail-panel">
          <p className="eyebrow">Cuadro{showGroup ? ' · Playoffs' : ''}</p>
          <h2>Llave de playoffs</h2>
          {officialPlayoffs.length > 0 ? <DrawBracket matches={officialPlayoffs} /> : <PlayoffBracket matches={playoffMatches} />}
        </section>
      )}
    </>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

function TournamentDetailsContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const [data, setData] = useState<TournamentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [official, setOfficial] = useState<DrawNode[] | null>(null);
  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'draw'>('standings');

  useEffect(() => {
    fetch(`/api/matches?id=${id}`)
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el torneo');
        return response.json();
      })
      .then((response: TournamentResponse) => setData(response))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    fetch(`/api/tournaments/${id}/draw`)
      .then((response) => (response.ok ? response.json() : null))
      .then((response) => setOfficial(response?.official ? response.matches : null))
      .catch(() => setOfficial(null));
  }, [id]);

  const orderedMatches = sortDrawMatches(data?.matchSummary ?? []);
  const hasStages = orderedMatches.some((match) => match.stage && match.stage !== 'GROUP');

  return (
    <main className="tournament-detail-page">
      <div className="tournament-detail-content">
        <Link href="/tournaments" className="back-link">← Volver a torneos</Link>
        {loading && <p className="empty-state">Cargando detalles...</p>}
        {error && <p className="empty-state">No se pudo cargar el torneo.</p>}
        {data?.tournamentData && (
          <>
            <header className="tournament-detail-header">
              <p className="eyebrow">
                {[data.tournamentData.type, data.tournamentData.category, data.tournamentData.level && `Nivel ${data.tournamentData.level}`].filter(Boolean).join(' · ') || 'Detalle de competencia'}
              </p>
              <h1>{data.tournamentData.name}</h1>
              <div className="tournament-champion">
                <LuTrophy aria-hidden="true" />
                <span>{data.tournamentData.championGender === 'FEMALE' ? 'Campeona' : 'Campeón'}</span>
                <strong>{data.tournamentData.champion || 'En disputa'}</strong>
              </div>
            </header>

            <div className="stats-tabs-container">
              <div className="stats-tabs" role="tablist" aria-label="Secciones del torneo">
                {([
                  ['standings', 'Posiciones', LuListOrdered],
                  ['matches', 'Partidos', LuSwords],
                  ['draw', 'Cuadro', LuGitFork],
                ] as const).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === key}
                    className={`stats-tab-btn ${activeTab === key ? 'active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'draw' && <DrawSection data={data} official={official} />}

            <div className="tournament-detail-grid">
              {activeTab === 'standings' && (
              <section className="tournament-detail-panel">
                <p className="eyebrow">{data.standingsFromGroupStage ? 'Fase de grupos' : 'Rendimiento'}</p>
                <h2>Tabla de posiciones</h2>
                <div className="tournament-detail-table-wrap">
                  <table className="tournament-detail-table tournament-standings">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Jugador</th>
                        <th title="Partidos ganados">PG</th>
                        <th title="Partidos perdidos">PP</th>
                        <th title="Diferencia de sets">Sets</th>
                        <th title="Diferencia de games">Games</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.playerStats.map((player, index) => (
                        <tr key={player.id} className={player.name === data.tournamentData?.champion ? 'is-champion' : undefined}>
                          <td className="tournament-pos">{index + 1}</td>
                          <td className="tournament-player">
                            <span className="tournament-player-name">
                              {player.name === data.tournamentData?.champion && <LuTrophy className="tournament-player-trophy" aria-label={data.tournamentData?.championGender === 'FEMALE' ? 'Campeona' : 'Campeón'} />}
                              {player.name}
                            </span>
                            {player.levelNote && <small className="level-gap" title="Nivel declarado del jugador respecto al del torneo">{player.levelNote}</small>}
                          </td>
                          <td>{player.matchesWon}</td>
                          <td>{player.matchesLost}</td>
                          <td>{signed(player.setsWon - player.setsLost)}</td>
                          <td>{signed(player.gamesWon - player.gamesLost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              )}

              {activeTab === 'matches' && (
              <section className="tournament-detail-panel">
                <p className="eyebrow">Historial</p>
                <h2>Partidos</h2>
                <div className="tournament-detail-table-wrap">
                  <table className="tournament-detail-table tournament-matches">
                    <thead>
                      <tr>
                        <th>Ganador</th>
                        <th>Rival</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedMatches.map((match, index) => {
                        const player1Won = match.winnerId === match.player1Id;
                        const winnerName = (player1Won ? match.player1Name : match.player2Name)?.name ?? 'Sin resultado';
                        const loserName = (player1Won ? match.player2Name : match.player1Name)?.name ?? 'Sin nombre';
                        // Scores are shown from the winner's point of view.
                        const score = (match.sets ?? [])
                          .map((set) =>
                            player1Won
                              ? formatSetScore(set.gamesJugador1, set.gamesJugador2, set.hasTiebreak, set.tiebreakPlayer1Points, set.tiebreakPlayer2Points)
                              : formatSetScore(set.gamesJugador2, set.gamesJugador1, set.hasTiebreak, set.tiebreakPlayer2Points, set.tiebreakPlayer1Points),
                          )
                          .join('  ');
                        const stage = match.stage ?? 'GROUP';
                        const startsStage = hasStages && (index === 0 || (orderedMatches[index - 1].stage ?? 'GROUP') !== stage);
                        return (
                          <Fragment key={`${match.player1Id}-${match.player2Id}-${index}`}>
                            {startsStage && (
                              <tr className="tournament-stage-row">
                                <td colSpan={3}>
                                  <span className={`stage-badge stage-${stage.toLowerCase()}`}>{STAGE_LABELS[stage] ?? stage}</span>
                                </td>
                              </tr>
                            )}
                            <tr>
                              <td className="tournament-details-winner">{winnerName}</td>
                              <td>{loserName}</td>
                              <td className="tournament-score">{score}</td>
                            </tr>
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function TournamentDetailsPage() {
  return (
    <Suspense fallback={<main className="tournament-detail-page"><p className="empty-state">Cargando detalles...</p></main>}>
      <TournamentDetailsContent />
    </Suspense>
  );
}