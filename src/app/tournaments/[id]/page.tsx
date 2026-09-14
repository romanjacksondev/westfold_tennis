'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { formatSetScore } from '@/utils/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type MatchSet = { gamesJugador1: number; gamesJugador2: number; hasTiebreak: boolean; tiebreakPlayer1Points: number | null; tiebreakPlayer2Points: number | null };

type Match = {
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
};

type TournamentResponse = {
  tournamentData: TournamentData | null;
  playerStats: { id: string; name: string; matchesWon: number; matchesLost: number; gamesWon: number; gamesLost: number }[];
  matchSummary: Match[];
};

// ─── Draw types ─────────────────────────────────────────────────────────────

type DrawSlot = { id: string | null; label: string };
type BracketMatch = { top: DrawSlot; bottom: DrawSlot };
type BracketRound = { roundName: string; matches: BracketMatch[] };

type DrawResponse =
  | { configured: false; message: string }
  | { configured: true; type: 'playoffs'; rounds: BracketRound[] }
  | { configured: true; type: 'round-robin'; rounds: BracketRound[] }
  | { configured: true; type: 'mixed'; groupRounds: BracketRound[]; bracketRounds: BracketRound[] };

// ─── Draw sub-components ────────────────────────────────────────────────────

function DrawMatchCard({ top, bottom }: BracketMatch) {
  return (
    <div className="draw-match">
      <div className={`draw-match-player${top.id === null && top.label !== 'Vacante' ? ' draw-placeholder' : ''}${top.label === 'Vacante' ? ' draw-vacancy' : ''}`}>
        {top.label}
      </div>
      <div className={`draw-match-player${bottom.id === null && bottom.label !== 'Vacante' ? ' draw-placeholder' : ''}${bottom.label === 'Vacante' ? ' draw-vacancy' : ''}`}>
        {bottom.label}
      </div>
    </div>
  );
}

function DrawColumn({ round }: { round: BracketRound }) {
  return (
    <div className="draw-round">
      <p className="draw-round-title">{round.roundName}</p>
      {round.matches.map((match, i) => (
        <DrawMatchCard key={i} top={match.top} bottom={match.bottom} />
      ))}
    </div>
  );
}

function PlayoffsBracket({ rounds }: { rounds: BracketRound[] }) {
  return (
    <div className="draw-rounds">
      {rounds.map((round, i) => (
        <DrawColumn key={i} round={round} />
      ))}
    </div>
  );
}

function RoundRobinFixture({ rounds }: { rounds: BracketRound[] }) {
  return (
    <div className="draw-rr-grid">
      {rounds.map((round, i) => (
        <div key={i} className="draw-rr-round">
          <p className="draw-round-title">{round.roundName}</p>
          {round.matches.map((match, j) => (
            <div key={j} className="draw-rr-match">
              <span className={match.top.label === 'Vacante' ? 'draw-vacancy' : ''}>{match.top.label}</span>
              <span className="draw-vs">vs</span>
              <span className={match.bottom.label === 'Vacante' ? 'draw-vacancy' : ''}>{match.bottom.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Draw section ────────────────────────────────────────────────────────────

function DrawSection({ id }: { id: string }) {
  const [draw, setDraw] = useState<DrawResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/tournaments/${id}/draw`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: DrawResponse) => setDraw(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="empty-state">Cargando cuadro...</p>;
  if (error) return <p className="empty-state draw-error">No se pudo cargar el cuadro del torneo.</p>;
  if (!draw) return null;

  if (!draw.configured) {
    return (
      <div className="draw-unconfigured">
        <span className="draw-unconfigured-icon">📋</span>
        <p>{draw.message}</p>
      </div>
    );
  }

  if (draw.type === 'playoffs') {
    return (
      <section className="tournament-detail-panel">
        <p className="eyebrow">Cuadro</p>
        <h2>Llave del torneo</h2>
        <PlayoffsBracket rounds={draw.rounds} />
      </section>
    );
  }

  if (draw.type === 'round-robin') {
    return (
      <section className="tournament-detail-panel">
        <p className="eyebrow">Cuadro</p>
        <h2>Fixture — Todos contra todos</h2>
        <RoundRobinFixture rounds={draw.rounds} />
      </section>
    );
  }

  if (draw.type === 'mixed') {
    return (
      <>
        <section className="tournament-detail-panel">
          <p className="eyebrow">Cuadro · Fase de grupos</p>
          <h2>Fixture — Todos contra todos</h2>
          <RoundRobinFixture rounds={draw.groupRounds} />
        </section>
        <section className="tournament-detail-panel">
          <p className="eyebrow">Cuadro · Playoffs</p>
          <h2>Clasificados a Playoffs</h2>
          <PlayoffsBracket rounds={draw.bracketRounds} />
        </section>
      </>
    );
  }

  return null;
}

// ─── Main page ───────────────────────────────────────────────────────────────

function TournamentDetailsContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const [data, setData] = useState<TournamentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/matches?id=${id}`)
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el torneo');
        return response.json();
      })
      .then((response: TournamentResponse) => setData(response))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="tournament-detail-page">
      <div className="tournament-detail-content">
        <Link href="/tournaments" className="back-link">← Volver a torneos</Link>
        {loading && <p className="empty-state">Cargando detalles...</p>}
        {error && <p className="empty-state">No se pudo cargar el torneo.</p>}
        {data?.tournamentData && (
          <>
            <header className="tournament-detail-header">
              <div>
                <p className="eyebrow">Detalle de competencia</p>
                <h1>{data.tournamentData.name}</h1>
                <div className="tournament-champion">
                  <span>Campeón</span>
                  <strong>{data.tournamentData.champion || 'En disputa'}</strong>
                </div>
              </div>
            </header>

            {/* Draw section */}
            <DrawSection id={id} />

            <section className="tournament-detail-panel">
              <p className="eyebrow">Rendimiento</p>
              <h2>Estadísticas de jugadores</h2>
              <div className="tournament-detail-table-wrap">
                <table className="tournament-detail-table">
                  <thead><tr><th>Jugador</th><th>PG</th><th>PP</th><th>Games</th></tr></thead>
                  <tbody>{data.playerStats.map((player) => <tr key={player.id}><td>{player.name}</td><td>{player.matchesWon}</td><td>{player.matchesLost}</td><td>{player.gamesWon - player.gamesLost >= 0 ? '+' : ''}{player.gamesWon - player.gamesLost}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
            <section className="tournament-detail-panel">
              <p className="eyebrow">Historial</p>
              <h2>Partidos</h2>
              <div className="tournament-detail-table-wrap">
                <table className="tournament-detail-table">
                  <thead><tr><th>Jugador 1</th><th>Jugador 2</th><th>Ganador</th><th>Resultado</th></tr></thead>
                  <tbody>{data.matchSummary.map((match) => <tr key={`${match.player1Id}-${match.player2Id}-${match.winnerId}`}><td>{match.player1Name?.name ?? 'Sin nombre'}</td><td>{match.player2Name?.name ?? 'Sin nombre'}</td><td className="tournament-details-winner">{data.playerStats.find((player) => player.id === match.winnerId)?.name ?? 'Sin resultado'}</td><td>{(match.sets ?? []).map((set) => formatSetScore(set.gamesJugador1, set.gamesJugador2, set.hasTiebreak, set.tiebreakPlayer1Points, set.tiebreakPlayer2Points)).join(' ')}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
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