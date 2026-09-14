'use client';

import { useMemo, useState } from 'react';
import { LuCalendar, LuFilter, LuHistory, LuSearch, LuTrophy, LuX } from 'react-icons/lu';
import { formatSetScore, MatchSummaryItem } from '@/utils/utils';

interface MatchHistoryProps {
  matches?: MatchSummaryItem[];
  players?: { id: string; name: string }[];
  initialPlayer1?: string;
  initialPlayer2?: string;
}

const MatchHistory = ({
  matches = [],
  players = [],
  initialPlayer1 = '',
  initialPlayer2 = '',
}: MatchHistoryProps) => {
  const [filterP1, setFilterP1] = useState<string>(initialPlayer1);
  const [filterP2, setFilterP2] = useState<string>(initialPlayer2);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all distinct player names from matches or players prop
  const playerNames = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      if (p.name) set.add(p.name);
    });
    matches.forEach((m) => {
      if (m.player1Name?.name) set.add(m.player1Name.name);
      if (m.player2Name?.name) set.add(m.player2Name.name);
    });
    return Array.from(set).sort();
  }, [matches, players]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const p1Name = m.player1Name?.name || '';
      const p2Name = m.player2Name?.name || '';
      const tournamentName = m.tournamentName || '';

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTournament = tournamentName.toLowerCase().includes(q);
        const matchesPlayer = p1Name.toLowerCase().includes(q) || p2Name.toLowerCase().includes(q);
        if (!matchesTournament && !matchesPlayer) return false;
      }

      // Player 1 filter
      if (filterP1) {
        const involvesP1 = p1Name === filterP1 || p2Name === filterP1;
        if (!involvesP1) return false;
      }

      // Player 2 filter
      if (filterP2) {
        const involvesP2 = p1Name === filterP2 || p2Name === filterP2;
        if (!involvesP2) return false;
      }

      return true;
    });
  }, [matches, filterP1, filterP2, searchQuery]);

  const handleClearFilters = () => {
    setFilterP1('');
    setFilterP2('');
    setSearchQuery('');
  };

  const hasActiveFilters = Boolean(filterP1 || filterP2 || searchQuery.trim());

  return (
    <div className="stats-history-container">
      {/* ─── Filters Bar ──────────────────────────────────────────────────── */}
      <div className="stats-history-filters-card">
        <div className="stats-filters-row">
          <div className="stats-filter-col">
            <label htmlFor="filter-player-1" className="stats-filter-label">
              <LuFilter className="w-3.5 h-3.5 text-[#31745d]" />
              Jugador 1
            </label>
            <select
              id="filter-player-1"
              value={filterP1}
              onChange={(e) => setFilterP1(e.target.value)}
              className="stats-filter-select"
            >
              <option value="">Todos los jugadores</option>
              {playerNames.map((name) => (
                <option key={name} value={name} disabled={name === filterP2}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="stats-filter-col">
            <label htmlFor="filter-player-2" className="stats-filter-label">
              <LuFilter className="w-3.5 h-3.5 text-[#31745d]" />
              Jugador 2
            </label>
            <select
              id="filter-player-2"
              value={filterP2}
              onChange={(e) => setFilterP2(e.target.value)}
              className="stats-filter-select"
            >
              <option value="">Todos los jugadores</option>
              {playerNames.map((name) => (
                <option key={name} value={name} disabled={name === filterP1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="stats-filter-col stats-filter-search">
            <label htmlFor="filter-search-query" className="stats-filter-label">
              <LuSearch className="w-3.5 h-3.5 text-[#31745d]" />
              Buscar Torneo
            </label>
            <div className="relative">
              <input
                id="filter-search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. Solanas, Hindu..."
                className="stats-filter-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="stats-search-clear-btn"
                  title="Limpiar búsqueda"
                  aria-label="Limpiar búsqueda"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="stats-filter-actions">
              <button
                type="button"
                onClick={handleClearFilters}
                className="stats-clear-filters-btn"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <div className="stats-history-count-bar">
          <span>
            Mostrando <strong>{filteredMatches.length}</strong> de <strong>{matches.length}</strong> partidos
          </span>
          {hasActiveFilters && (
            <span className="stats-active-filter-badge">
              Filtro activo
            </span>
          )}
        </div>
      </div>

      {/* ─── Matches Table ────────────────────────────────────────────────── */}
      {filteredMatches.length === 0 ? (
        <div className="empty-state mt-6">
          <LuHistory className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p>No se encontraron partidos para los filtros seleccionados.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="stats-view-history-btn mt-3"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      ) : (
        <div className="leaderboard-table-wrap mt-6">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="w-28">Fecha</th>
                <th>Torneo</th>
                <th>Enfrentamiento</th>
                <th>Ganador</th>
                <th className="text-right">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((m, idx) => {
                const p1Name = m.player1Name?.name || 'Desconocido';
                const p2Name = m.player2Name?.name || 'Desconocido';
                const isP1Winner = m.winnerId === m.player1Id;
                const winnerName = isP1Winner ? p1Name : p2Name;

                // Format sets
                const scoreString = (m.sets || [])
                  .map((s) =>
                    formatSetScore(
                      s.gamesJugador1,
                      s.gamesJugador2,
                      s.hasTiebreak,
                      s.tiebreakPlayer1Points,
                      s.tiebreakPlayer2Points
                    )
                  )
                  .join(', ');

                return (
                  <tr key={m.id || `${p1Name}-${p2Name}-${m.date}-${idx}`}>
                    <td className="text-xs text-gray-500 font-mono">
                      <span className="flex items-center gap-1">
                        <LuCalendar className="w-3.5 h-3.5 text-gray-400" />
                        {m.date}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-[#18231f]">
                        {m.tournamentName || 'Torneo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className={isP1Winner ? 'font-bold text-[#183b32]' : 'text-gray-600'}>
                          {p1Name}
                        </span>
                        <span className="text-gray-400 text-xs">vs</span>
                        <span className={!isP1Winner ? 'font-bold text-[#183b32]' : 'text-gray-600'}>
                          {p2Name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="stats-winner-badge">
                        <LuTrophy className="w-3 h-3 text-[#31745d]" />
                        {winnerName}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-mono text-sm font-semibold text-[#18231f] bg-[#f7f9f7] px-2.5 py-1 rounded border border-[#e0e7e2]">
                        {scoreString || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;