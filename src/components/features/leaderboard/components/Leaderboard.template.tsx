'use client';
import { Fragment, useState } from 'react';
import { Spinner } from 'flowbite-react';
import {
  LuCalendar,
  LuChevronDown,
  LuChevronUp,
  LuClock,
  LuInfo,
  LuTrophy,
} from 'react-icons/lu';

export type RankingMode = 'year' | 'calendar';

export type LeaderboardEntry = {
  key: string;
  value: {
    points: number;
    breakdown: { tournament: string; points: number }[];
  };
};

interface LeaderboardTemplateProps {
  leaderboard: LeaderboardEntry[];
  rankingMode: RankingMode;
  setRankingMode: (mode: RankingMode) => void;
  loading: boolean;
  error: boolean;
}

const LeaderboardTemplate = ({
  leaderboard,
  rankingMode,
  setRankingMode,
  loading,
  error,
}: LeaderboardTemplateProps) => {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const toggleExpand = (playerName: string) => {
    setExpandedPlayer((prev) => (prev === playerName ? null : playerName));
  };

  const getPosBadgeClass = (index: number) => {
    if (index === 0) return 'leaderboard-pos-badge leaderboard-pos-1';
    if (index === 1) return 'leaderboard-pos-badge leaderboard-pos-2';
    if (index === 2) return 'leaderboard-pos-badge leaderboard-pos-3';
    return 'leaderboard-pos-badge leaderboard-pos-default';
  };

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-header">
        <div>
          <p className="eyebrow">Clasificación oficial</p>
          <h1>Ranking</h1>
          <p className="muted">Rendimiento y puntuación de los jugadores del circuito.</p>
        </div>
        <div className="status-pill">
          <span />
          {rankingMode === 'calendar' ? 'Año calendario (1/1 - 31/12)' : 'Últimos 12 meses'}
        </div>
      </header>

      {/* Tabs para alternar entre una tabla y la otra */}
      <div className="leaderboard-tabs-container">
        <div className="leaderboard-tabs" role="tablist" aria-label="Selector de tipo de ranking">
          <button
            type="button"
            role="tab"
            aria-selected={rankingMode === 'year'}
            className={`leaderboard-tab-btn ${rankingMode === 'year' ? 'active' : ''}`}
            onClick={() => {
              setRankingMode('year');
              setExpandedPlayer(null);
            }}
          >
            <LuClock className="w-4 h-4 shrink-0" />
            <span>Últimos 12 meses</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={rankingMode === 'calendar'}
            className={`leaderboard-tab-btn ${rankingMode === 'calendar' ? 'active' : ''}`}
            onClick={() => {
              setRankingMode('calendar');
              setExpandedPlayer(null);
            }}
          >
            <LuCalendar className="w-4 h-4 shrink-0" />
            <span>Año calendario (1/1 al 31/12)</span>
          </button>
        </div>

        <p className="text-xs text-[#68756f] flex items-center justify-center gap-1.5 text-center">
          <LuInfo className="w-3.5 h-3.5 shrink-0 text-[#31745d]" />
          {rankingMode === 'year'
            ? 'Ventana móvil acumulada de los últimos 365 días.'
            : 'Puntos obtenidos exclusivamente dentro del año calendario en curso.'}
        </p>
      </div>

      <section className="leaderboard-panel">
        <div className="panel-heading mb-4">
          <div>
            <p className="eyebrow">Posiciones</p>
            <h2>
              {rankingMode === 'year'
                ? 'Ranking del Último Año'
                : 'Ranking del Año Calendario'}
            </h2>
            <p className="text-sm text-[#68756f]">
              {rankingMode === 'year'
                ? 'Posiciones de los jugadores según los puntos acumulados en los últimos 12 meses.'
                : 'Puntos obtenidos durante el año calendario actual (1 de enero al 31 de diciembre).'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner size="xl" aria-label="Cargando ranking..." />
          </div>
        ) : error ? (
          <div className="empty-state py-12 text-center text-[#87928c]">
            No se pudo cargar la información del ranking para este período.
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state py-12 text-center text-[#87928c]">
            No hay torneos finalizados ni puntos registrados para este período.
          </div>
        ) : rankingMode === 'year' ? (
          /* TABLA 1: ÚLTIMO AÑO (ROLLING 12 MESES) */
          <div className="leaderboard-table-wrap">
            <table
              className="leaderboard-table"
              aria-label="Tabla de posiciones de los últimos 12 meses"
            >
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Pos.</th>
                  <th>Jugador</th>
                  <th style={{ textAlign: 'right' }}>Torneos jugados</th>
                  <th style={{ textAlign: 'right' }}>Puntos (12 meses)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => {
                  const isExpanded = expandedPlayer === player.key;
                  return (
                    <Fragment key={`year-${player.key}`}>
                      <tr
                        className="leaderboard-row-interactive"
                        onClick={() => toggleExpand(player.key)}
                        title="Clic para ver desglose de torneos"
                      >
                        <td className="leaderboard-position">
                          <span className={getPosBadgeClass(index)}>
                            {index === 0 ? (
                              <LuTrophy className="w-3.5 h-3.5" />
                            ) : (
                              index + 1
                            )}
                          </span>
                        </td>
                        <td className="leaderboard-player font-semibold text-[#18231f]">
                          {player.key}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef2ef] text-[#45534d]">
                            {player.value.breakdown.length} torneos
                          </span>
                        </td>
                        <td
                          className="leaderboard-points"
                          style={{ textAlign: 'right' }}
                        >
                          {player.value.points} pts
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="p-1 rounded text-[#68756f] hover:text-[#183b32]"
                            aria-label={`Ver torneos de ${player.key}`}
                          >
                            {isExpanded ? (
                              <LuChevronUp className="w-4 h-4" />
                            ) : (
                              <LuChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="leaderboard-breakdown-row">
                          <td colSpan={5}>
                            <div className="leaderboard-breakdown-box">
                              <p className="text-xs font-bold text-[#45534d] uppercase tracking-wider mb-2">
                                Torneos computados en los últimos 12 meses ({player.value.breakdown.length})
                              </p>
                              <div className="leaderboard-breakdown-grid">
                                {player.value.breakdown.map((item, itemIdx) => (
                                  <div
                                    key={`b-year-${item.tournament}-${itemIdx}`}
                                    className="leaderboard-breakdown-item"
                                  >
                                    <span className="font-medium text-[#18231f]">
                                      {item.tournament}
                                    </span>
                                    <span className="font-bold text-[#31745d]">
                                      +{item.points} pts
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* TABLA 2: AÑO CALENDARIO (1/1 AL 31/12) */
          <div className="leaderboard-table-wrap">
            <table
              className="leaderboard-table"
              aria-label="Tabla de posiciones del año calendario"
            >
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Pos.</th>
                  <th>Jugador</th>
                  <th style={{ textAlign: 'right' }}>Torneos jugados</th>
                  <th style={{ textAlign: 'right' }}>Puntos (Año calendario)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => {
                  const isExpanded = expandedPlayer === player.key;
                  return (
                    <Fragment key={`cal-${player.key}`}>
                      <tr
                        className="leaderboard-row-interactive"
                        onClick={() => toggleExpand(player.key)}
                        title="Clic para ver desglose de torneos"
                      >
                        <td className="leaderboard-position">
                          <span className={getPosBadgeClass(index)}>
                            {index === 0 ? (
                              <LuTrophy className="w-3.5 h-3.5" />
                            ) : (
                              index + 1
                            )}
                          </span>
                        </td>
                        <td className="leaderboard-player font-semibold text-[#18231f]">
                          {player.key}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef2ef] text-[#45534d]">
                            {player.value.breakdown.length} torneos
                          </span>
                        </td>
                        <td
                          className="leaderboard-points"
                          style={{ textAlign: 'right' }}
                        >
                          {player.value.points} pts
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="p-1 rounded text-[#68756f] hover:text-[#183b32]"
                            aria-label={`Ver torneos de ${player.key}`}
                          >
                            {isExpanded ? (
                              <LuChevronUp className="w-4 h-4" />
                            ) : (
                              <LuChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="leaderboard-breakdown-row">
                          <td colSpan={5}>
                            <div className="leaderboard-breakdown-box">
                              <p className="text-xs font-bold text-[#45534d] uppercase tracking-wider mb-2">
                                Torneos computados en el año calendario ({player.value.breakdown.length})
                              </p>
                              <div className="leaderboard-breakdown-grid">
                                {player.value.breakdown.map((item, itemIdx) => (
                                  <div
                                    key={`b-cal-${item.tournament}-${itemIdx}`}
                                    className="leaderboard-breakdown-item"
                                  >
                                    <span className="font-medium text-[#18231f]">
                                      {item.tournament}
                                    </span>
                                    <span className="font-bold text-[#31745d]">
                                      +{item.points} pts
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default LeaderboardTemplate;
