'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { formatSetScore } from '@/utils/utils';

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

function TournamentDetailsContent() {
  const { id } = useParams<{ id: string }>();
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
        <Link href="/tournaments" className="back-link">Volver a torneos</Link>
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
                  <strong>{data.tournamentData.champion}</strong>
                </div>
              </div>
            </header>
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