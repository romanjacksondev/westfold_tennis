'use client';

import { useState } from 'react';
import { Spinner } from 'flowbite-react';
import { LuHistory, LuSwords, LuTrophy } from 'react-icons/lu';
import { MatchSummaryItem, PlayerChampionships } from '@/utils/utils';
import ChampionshipsTemplate from './Championships.template';
import H2H, { H2HRecord } from './H2H';
import MatchHistory from './MatchHistory';

export type StatsTab = 'h2h' | 'championships' | 'history';

interface StatsTemplateProps {
  h2h?: Record<string, H2HRecord>;
  championships?: PlayerChampionships[];
  matches?: MatchSummaryItem[];
  players?: { id: string; name: string }[];
  loading?: boolean;
  error?: boolean;
}

const StatsTemplate = ({
  h2h = {},
  championships = [],
  matches = [],
  players = [],
  loading = false,
  error = false,
}: StatsTemplateProps) => {
  const [activeTab, setActiveTab] = useState<StatsTab>('h2h');
  const [historyP1, setHistoryP1] = useState<string>('');
  const [historyP2, setHistoryP2] = useState<string>('');

  const handleNavigateToHistory = (p1: string, p2: string) => {
    setHistoryP1(p1);
    setHistoryP2(p2);
    setActiveTab('history');
  };

  const getSubtitle = () => {
    if (activeTab === 'h2h') return 'Historial de enfrentamientos directos y balance general entre jugadores.';
    if (activeTab === 'championships') return 'Palmarés histórico y cantidad de torneos ganados por categoría.';
    return 'Registro detallado de todos los partidos disputados con sus respectivos marcadores.';
  };

  return (
    <main className="stats-page">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <header className="stats-header">
        <div>
          <p className="eyebrow">Circuito</p>
          <h1>Estadísticas</h1>
          <p className="muted">{getSubtitle()}</p>
        </div>
        <div className="status-pill">
          <span />
          {loading ? 'Cargando datos...' : 'Datos oficiales'}
        </div>
      </header>

      {/* ─── Segmented Tabs ────────────────────────────────────────────────── */}
      <div className="stats-tabs-container">
        <div className="stats-tabs" role="tablist" aria-label="Secciones de estadísticas">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'h2h'}
            className={`stats-tab-btn ${activeTab === 'h2h' ? 'active' : ''}`}
            onClick={() => setActiveTab('h2h')}
          >
            <LuSwords className="w-4 h-4" />
            H2H
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'championships'}
            className={`stats-tab-btn ${activeTab === 'championships' ? 'active' : ''}`}
            onClick={() => setActiveTab('championships')}
          >
            <LuTrophy className="w-4 h-4" />
            Torneos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            className={`stats-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <LuHistory className="w-4 h-4" />
            Historial Partidos
          </button>
        </div>
      </div>

      {/* ─── Main Content Panel ────────────────────────────────────────────── */}
      <section className="stats-panel">
        {loading ? (
          <div className="stats-loading-box">
            <Spinner size="xl" aria-label="Cargando estadísticas..." />
            <p>Obteniendo información del circuito...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="text-rose-600 font-medium">Ocurrió un error al cargar las estadísticas.</p>
            <p className="text-sm text-gray-500 mt-1">Por favor verifica tu conexión o intenta recargar la página.</p>
          </div>
        ) : (
          <>
            {activeTab === 'h2h' && (
              <H2H h2h={h2h} onNavigateToHistory={handleNavigateToHistory} />
            )}
            {activeTab === 'championships' && (
              <ChampionshipsTemplate championships={championships} />
            )}
            {activeTab === 'history' && (
              <MatchHistory
                matches={matches}
                players={players}
                initialPlayer1={historyP1}
                initialPlayer2={historyP2}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default StatsTemplate;

