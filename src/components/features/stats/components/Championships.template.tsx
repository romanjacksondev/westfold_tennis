'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { LuChevronDown, LuChevronUp, LuTrophy, LuMedal, LuCalendar } from 'react-icons/lu';
import { PlayerChampionships } from '@/utils/utils';

interface ChampionshipsTemplateProps {
  championships?: PlayerChampionships[];
}

const ChampionshipsTemplate = ({ championships = [] }: ChampionshipsTemplateProps) => {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const toggleExpand = (playerName: string) => {
    setExpandedPlayer((prev) => (prev === playerName ? null : playerName));
  };

  if (!championships || championships.length === 0) {
    return (
      <div className="empty-state">
        <LuTrophy className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p>No hay registro de torneos ganados hasta el momento.</p>
      </div>
    );
  }

  // Extract all distinct categories and order them hierarchically
  const categoryOrder: Record<string, number> = {
    'Grand Slam': 1,
    'Master 1000': 2,
    'ATP 500': 3,
    'ATP 250': 4,
  };

  const allCategoriesSet = new Set<string>();
  championships.forEach((player) => {
    Object.keys(player.points || {}).forEach((cat) => allCategoriesSet.add(cat));
  });

  const categories = Array.from(allCategoriesSet).sort((a, b) => {
    const orderA = categoryOrder[a] ?? 99;
    const orderB = categoryOrder[b] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  const totalTitles = championships.reduce((acc, p) => acc + p.total, 0);
  const leader = championships[0];

  const getPosBadgeClass = (index: number) => {
    if (index === 0) return 'leaderboard-pos-badge leaderboard-pos-1';
    if (index === 1) return 'leaderboard-pos-badge leaderboard-pos-2';
    if (index === 2) return 'leaderboard-pos-badge leaderboard-pos-3';
    return 'leaderboard-pos-badge leaderboard-pos-default';
  };

  return (
    <div className="stats-championships-container">
      {/* ─── Highlights Cards ────────────────────────────────────────────── */}
      <div className="stats-champs-summary-grid">
        <div className="stats-summary-card">
          <div className="stats-summary-icon-box text-[#31745d] bg-[#edf6f2]">
            <LuTrophy className="w-5 h-5" />
          </div>
          <div>
            <span className="stats-summary-label">Total Torneos Finalizados</span>
            <strong className="stats-summary-val">{totalTitles}</strong>
          </div>
        </div>

        <div className="stats-summary-card">
          <div className="stats-summary-icon-box text-[#b38600] bg-[#fcf4db]">
            <LuMedal className="w-5 h-5" />
          </div>
          <div>
            <span className="stats-summary-label">Máximo Campeón</span>
            <strong className="stats-summary-val">
              {leader ? `${leader.name} (${leader.total})` : '—'}
            </strong>
          </div>
        </div>

        <div className="stats-summary-card">
          <div className="stats-summary-icon-box text-[#d66e52] bg-[#fbe9e4]">
            <LuCalendar className="w-5 h-5" />
          </div>
          <div>
            <span className="stats-summary-label">Campeones Diferentes</span>
            <strong className="stats-summary-val">{championships.length}</strong>
          </div>
        </div>
      </div>

      {/* ─── Palmarés Table ──────────────────────────────────────────────── */}
      <div className="leaderboard-table-wrap mt-6">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="w-16">Pos</th>
              <th>Jugador</th>
              <th className="text-right">Total Títulos</th>
              {categories.map((cat) => (
                <th key={cat} className="text-right">
                  {cat}
                </th>
              ))}
              <th className="w-12 text-center" aria-label="Desplegar"></th>
            </tr>
          </thead>
          <tbody>
            {championships.map((player, index) => {
              const isExpanded = expandedPlayer === player.name;
              return (
                <Fragment key={player.name}>
                  <tr
                    className={`leaderboard-row-interactive ${isExpanded ? 'bg-[#f7f9f7]' : ''}`}
                    onClick={() => toggleExpand(player.name)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(player.name);
                      }
                    }}
                  >
                    <td>
                      <span className={getPosBadgeClass(index)}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <strong className="leaderboard-player">{player.name}</strong>
                        {index === 0 && (
                          <span className="stats-crown-pill" title="Líder en títulos">
                            🏆 Más laureado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right">
                      <strong className="leaderboard-points text-base">{player.total}</strong>
                    </td>
                    {categories.map((cat) => {
                      const count = player.points[cat] || 0;
                      return (
                        <td key={cat} className="text-right font-mono">
                          {count > 0 ? (
                            <span className="stats-cat-count">{count}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center text-gray-400">
                      {isExpanded ? (
                        <LuChevronUp className="w-4 h-4 inline" />
                      ) : (
                        <LuChevronDown className="w-4 h-4 inline" />
                      )}
                    </td>
                  </tr>

                  {/* Expanded Tournaments Accordion */}
                  {isExpanded && (
                    <tr className="leaderboard-breakdown-row">
                      <td colSpan={3 + categories.length + 1}>
                        <div className="leaderboard-breakdown-box">
                          <p className="eyebrow mb-2">Títulos ganados por {player.name}:</p>
                          <div className="leaderboard-breakdown-grid">
                            {(player.tournaments || []).map((t) => (
                              <div key={t.id} className="leaderboard-breakdown-item">
                                <div>
                                  <Link
                                    href={`/tournaments/${t.id}`}
                                    className="font-medium text-[#183b32] hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {t.name}
                                  </Link>
                                  <div className="text-xs text-gray-500">{t.date}</div>
                                </div>
                                <span className="stats-badge-category">{t.category}</span>
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
    </div>
  );
};

export default ChampionshipsTemplate;

