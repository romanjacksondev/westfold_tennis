'use client';
import { Fragment, useState } from 'react';
import { LuChevronDown, LuMedal, LuTrophy } from 'react-icons/lu';

export type RankingMode = 'year' | 'calendar';

export type LeaderboardEntry = {
  key: string;
  nickname?: string | null;
  value: {
    points: number;
    breakdown: { tournament: string; points: number }[];
  };
};

export type LeaderboardData = {
  male: LeaderboardEntry[];
  female: LeaderboardEntry[];
};

type GenderTab = 'male' | 'female';

interface LeaderboardTemplateProps {
  leaderboard: LeaderboardData;
  rankingMode: RankingMode;
  setRankingMode: (mode: RankingMode) => void;
  loading: boolean;
  error: boolean;
}

const GENDER_OPTIONS: { value: GenderTab; label: string }[] = [
  { value: 'male', label: 'Hombres' },
  { value: 'female', label: 'Mujeres' },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const Avatar = ({ entry, size }: { entry: LeaderboardEntry; size: 'lg' | 'md' | 'sm' }) => {
  const [failed, setFailed] = useState(false);
  const src = entry.nickname ? `/img/avatar/${entry.nickname}.jpeg` : null;

  return (
    <span className={`lb-avatar lb-avatar-${size}`}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        getInitials(entry.key)
      )}
    </span>
  );
};

const PODIUM_ORDER = [1, 0, 2];
const PODIUM_LABELS = ['1º', '2º', '3º'];

const Podium = ({ entries, periodLabel }: { entries: LeaderboardEntry[]; periodLabel: string }) => (
  <div className="lb-podium" aria-label={`Podio ${periodLabel}`}>
    {PODIUM_ORDER.map((position) => {
      const entry = entries[position];
      if (!entry) return <div key={position} className="lb-podium-slot lb-podium-empty" />;
      return (
        <div key={entry.key} className={`lb-podium-slot lb-podium-${position + 1}`}>
          <span className="lb-podium-medal">
            {position === 0 ? <LuTrophy /> : <LuMedal />}
            {PODIUM_LABELS[position]}
          </span>
          <Avatar entry={entry} size={position === 0 ? 'lg' : 'md'} />
          <strong className="lb-podium-name">{entry.key}</strong>
          <span className="lb-podium-points">{entry.value.points} pts</span>
          <span className="lb-podium-meta">{entry.value.breakdown.length} torneos</span>
        </div>
      );
    })}
  </div>
);

const RankingList = ({
  entries,
  offset,
  maxPoints,
  rankingMode,
}: {
  entries: LeaderboardEntry[];
  offset: number;
  maxPoints: number;
  rankingMode: RankingMode;
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const breakdownLabel = rankingMode === 'year' ? 'los últimos 12 meses' : 'el año calendario';

  return (
    <ul className="lb-list">
      {entries.map((entry, index) => {
        const isExpanded = expanded === entry.key;
        const width = maxPoints > 0 ? Math.max(4, (entry.value.points / maxPoints) * 100) : 0;
        return (
          <Fragment key={entry.key}>
            <li>
              <button
                type="button"
                className="lb-row"
                aria-expanded={isExpanded}
                onClick={() => setExpanded(isExpanded ? null : entry.key)}
              >
                <span className="lb-row-pos">{offset + index + 1}</span>
                <Avatar entry={entry} size="sm" />
                <span className="lb-row-main">
                  <span className="lb-row-name">{entry.key}</span>
                  <span className="lb-row-bar">
                    <span style={{ width: `${width}%` }} />
                  </span>
                </span>
                <span className="lb-row-tournaments">{entry.value.breakdown.length} torneos</span>
                <span className="lb-row-points">{entry.value.points} pts</span>
                <LuChevronDown className={`lb-row-chevron ${isExpanded ? 'open' : ''}`} />
              </button>
              {isExpanded && (
                <div className="lb-breakdown">
                  <p>
                    Torneos computados en {breakdownLabel} ({entry.value.breakdown.length})
                  </p>
                  <div className="lb-chips">
                    {entry.value.breakdown.map((item, itemIdx) => (
                      <span key={`${item.tournament}-${itemIdx}`} className="lb-chip">
                        {item.tournament} <b>+{item.points}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
};

const Skeleton = () => (
  <div className="lb-skeleton" aria-label="Cargando ranking..." role="status">
    <div className="lb-skeleton-podium">
      <span />
      <span />
      <span />
    </div>
    {[0, 1, 2].map((i) => (
      <span key={i} className="lb-skeleton-row" />
    ))}
  </div>
);

const LeaderboardTemplate = ({
  leaderboard,
  rankingMode,
  setRankingMode,
  loading,
  error,
}: LeaderboardTemplateProps) => {
  const [gender, setGender] = useState<GenderTab>('male');
  const entries = leaderboard[gender];
  const rest = entries.slice(3);
  const maxPoints = entries[0]?.value.points ?? 0;
  const periodLabel = rankingMode === 'year' ? 'Últimos 12 meses' : 'Año calendario';

  return (
    <main className="leaderboard-page">
      <header className="lb-header">
        <p className="eyebrow">Clasificación oficial</p>
        <h1>Ranking</h1>
        <p className="muted">Rendimiento y puntuación de los jugadores del circuito.</p>
      </header>

      <div className="lb-controls">
        <div className="lb-segmented" role="tablist" aria-label="Categoría">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={gender === option.value}
              className={gender === option.value ? 'active' : ''}
              onClick={() => setGender(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="lb-period" role="tablist" aria-label="Período">
          <button
            type="button"
            role="tab"
            aria-selected={rankingMode === 'year'}
            className={rankingMode === 'year' ? 'active' : ''}
            onClick={() => setRankingMode('year')}
          >
            12 meses
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={rankingMode === 'calendar'}
            className={rankingMode === 'calendar' ? 'active' : ''}
            onClick={() => setRankingMode('calendar')}
            title="Del 1 de enero al 31 de diciembre"
          >
            Año calendario
          </button>
        </div>
      </div>

      <section className="lb-content" key={`${gender}-${rankingMode}`}>
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="lb-empty">No se pudo cargar la información del ranking.</div>
        ) : entries.length === 0 ? (
          <div className="lb-empty">
            <LuTrophy />
            <span>Todavía no hay puntos registrados para este período.</span>
          </div>
        ) : (
          <>
            <Podium entries={entries} periodLabel={periodLabel} />
            {rest.length > 0 && (
              <RankingList
                entries={rest}
                offset={3}
                maxPoints={maxPoints}
                rankingMode={rankingMode}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default LeaderboardTemplate;
