'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight,
  LuMedal,
  LuSwords,
  LuTrophy,
  LuUsers,
} from 'react-icons/lu';

type Entry = {
  key: string;
  photo?: string | null;
  record: { wins: number; losses: number; titles: number; form: ('W' | 'L')[] };
  value: { points: number };
};
type Ranking = { male: Entry[]; female: Entry[]; levels: { id: string; name: string }[] };
type Mode = 'year' | 'calendar';
type Gender = 'male' | 'female';

type HomeData = {
  counts: { players: number; tournaments: number; matches: number };
  lastTournament: {
    id: string;
    name: string;
    type: string | null;
    category: string | null;
    champion: string | null;
    championGender: 'MALE' | 'FEMALE' | null;
  } | null;
  me: {
    name: string;
    nickname: string | null;
    gender: 'MALE' | 'FEMALE';
    wins: number;
    losses: number;
    titles: number;
    level: { current: string | null; suggested: string | null; direction: 'up' | 'down' | 'initial' | null };
    lastMatch: {
      tournamentId: string | null;
      tournamentName: string | null;
      stage: string | null;
      opponent: string;
      won: boolean;
      score: string;
    } | null;
  } | null;
};

const SLIDES: { key: Gender; label: string }[] = [
  { key: 'male', label: 'Hombres' },
  { key: 'female', label: 'Mujeres' },
];
const TOP = 5;
const AUTOPLAY_MS = 7000;

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

const Avatar = ({ entry }: { entry: Entry }) => {
  const [failed, setFailed] = useState(false);
  return (
    <span className="lb-avatar lb-avatar-sm">
      {entry.photo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.photo} alt="" onError={() => setFailed(true)} />
      ) : (
        initials(entry.key)
      )}
    </span>
  );
};

const Form = ({ results }: { results: ('W' | 'L')[] }) => (
  <span className="lb-form" role="img" aria-label={`Últimos partidos: ${results.join(' ')}`}>
    {results.map((r, i) => (
      <span key={i} className={r === 'W' ? 'win' : 'loss'} />
    ))}
  </span>
);

function RankingCarousel({ myName, myGender }: { myName?: string; myGender?: Gender }) {
  const [mode, setMode] = useState<Mode>('year');
  const [level, setLevel] = useState('all');
  const [cache, setCache] = useState<Record<string, Ranking>>({});
  const [error, setError] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const defaultIndex = myGender === 'female' ? 1 : 0;
  const index = chosen ?? defaultIndex;
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const key = `${mode}|${level}`;
    if (cache[key]) return;
    let cancelled = false;
    fetch(`/api/leaderboard?rankingMode=${mode}&level=${encodeURIComponent(level)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled)
          setCache((prev) => ({
            ...prev,
            [key]: { male: data.male ?? [], female: data.female ?? [], levels: data.levels ?? [] },
          }));
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [mode, level, cache]);

  const go = useCallback((next: number) => setChosen((next + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const timer = setInterval(
      () => setChosen((c) => ((c ?? defaultIndex) + 1) % SLIDES.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [paused, defaultIndex]);

  const ranking = cache[`${mode}|${level}`];
  const levelOptions = Object.values(cache)[0]?.levels ?? [];

  return (
    <section
      className="home-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="home-section-head">
        <div>
          <p className="eyebrow">Clasificación</p>
          <h2>Los mejores del circuito</h2>
        </div>
        <div className="lb-period" role="tablist" aria-label="Período">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'year'}
            className={mode === 'year' ? 'active' : ''}
            onClick={() => setMode('year')}
          >
            12 meses
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'calendar'}
            className={mode === 'calendar' ? 'active' : ''}
            onClick={() => setMode('calendar')}
          >
            Año calendario
          </button>
        </div>
      </div>

      {levelOptions.length > 0 && (
        <div className="lb-levels" role="tablist" aria-label="Nivel">
          {[{ id: 'all', name: 'Todos' }, ...levelOptions].map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={level === option.id}
              className={level === option.id ? 'active' : ''}
              onClick={() => setLevel(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}

      <div
        className="home-carousel"
        onTouchStart={(e) => {
          setPaused(true);
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start !== null && Math.abs(e.changedTouches[0].clientX - start) > 40)
            go(index + (e.changedTouches[0].clientX < start ? 1 : -1));
          setTimeout(() => setPaused(false), 4000);
        }}
      >
        <div className="home-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((slide) => {
            const list = ranking?.[slide.key] ?? [];
            const top = list.slice(0, TOP);
            const meIndex = myName ? list.findIndex((e) => e.key === myName) : -1;
            const rows =
              meIndex >= TOP
                ? [
                    ...top.map((e, i) => ({ e, pos: i + 1 })),
                    { e: list[meIndex], pos: meIndex + 1 },
                  ]
                : top.map((e, i) => ({ e, pos: i + 1 }));
            return (
              <div
                key={slide.key}
                className="home-slide"
                aria-hidden={SLIDES[index].key !== slide.key}
              >
                <div className="home-slide-card">
                  <h3>{slide.label}</h3>
                  {error ? (
                    <p className="empty-state">No se pudo cargar el ranking.</p>
                  ) : !ranking ? (
                    <p className="empty-state">Cargando ranking...</p>
                  ) : rows.length === 0 ? (
                    <p className="empty-state">Todavía no hay puntos en este período.</p>
                  ) : (
                    <ol className="home-rank-list">
                      {rows.map(({ e, pos }) => (
                        <li
                          key={e.key}
                          className={`${pos <= 3 ? `top-${pos}` : ''}${e.key === myName ? ' is-me' : ''}${pos > TOP ? ' is-extra' : ''}`}
                        >
                          <span className="home-rank-pos">{pos <= 3 ? <LuMedal /> : pos}</span>
                          <Avatar entry={e} />
                          <span className="home-rank-name">
                            {e.key}
                            {e.key === myName && <em>Vos</em>}
                          </span>
                          <Form results={e.record.form} />
                          <strong className="home-rank-points">{e.value.points}</strong>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-carousel-footer">
        <div className="home-carousel-nav">
          <button
            type="button"
            className="home-carousel-arrow"
            aria-label="Anterior"
            onClick={() => go(index - 1)}
          >
            <LuChevronLeft />
          </button>
          <div className="home-dots" role="tablist" aria-label="Categoría">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                role="tab"
                aria-selected={index === i}
                aria-label={slide.label}
                className={index === i ? 'active' : ''}
                onClick={() => setChosen(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="home-carousel-arrow"
            aria-label="Siguiente"
            onClick={() => go(index + 1)}
          >
            <LuChevronRight />
          </button>
        </div>
        <Link href="/leaderboard" className="home-link">
          Ver ranking completo <LuArrowRight />
        </Link>
      </div>
    </section>
  );
}

function LastTournament({ data }: { data: NonNullable<HomeData['lastTournament']> }) {
  const label = data.championGender === 'FEMALE' ? 'Campeona' : 'Campeón';
  return (
    <div className="home-card">
      <p className="eyebrow">Último torneo</p>
      <h3>{data.name}</h3>
      <p className="home-card-meta">{[data.type, data.category].filter(Boolean).join(' · ')}</p>
      {data.champion && (
        <div className="tournament-champion">
          <LuTrophy aria-hidden="true" />
          <span>{label}</span>
          <strong>{data.champion}</strong>
        </div>
      )}
    </div>
  );
}

const HOW_IT_WORKS = [
  { title: 'Jugá', text: 'Anotate en torneos de eliminación, todos contra todos o mixtos.' },
  {
    title: 'Sumá puntos',
    text: 'Cada partido ganado y cada fase alcanzada suma según la categoría.',
  },
  {
    title: 'Escalá',
    text: 'Seguí tu posición en el ranking y comparate con el resto del circuito.',
  },
];

const QUICK_LINKS = [
  { href: '/tournaments', label: 'Torneos' },
  { href: '/players', label: 'Jugadores' },
  { href: '/stats', label: 'Estadísticas' },
  { href: '/information', label: 'Reglas y puntuación' },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    fetch('/api/home')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, [status]);

  const me = data?.me ?? null;
  const loggedIn = status === 'authenticated';
  const record = me ? me.wins + me.losses : 0;
  const winRate = me && record > 0 ? Math.round((me.wins / record) * 100) : 0;

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-hero-eyebrow">Westfold Tennis Club</p>
          {loggedIn ? (
            <>
              <h1>Hola, {me?.nickname || me?.name || session?.user?.name || 'jugador'}</h1>
              <p>
                Así viene el circuito. Revisá tu posición, tus últimos partidos y lo que se juega.
              </p>
              {me?.level.current && <span className="level-badge">Nivel {me.level.current}</span>}
              {me?.level.suggested && (
                <p className="level-suggestion">
                  💡 Por tus últimos resultados, podrías jugar nivel <strong>{me.level.suggested}</strong>.
                </p>
              )}
              <div className="home-hero-actions">
                {session?.user?.playerId && (
                  <Link href={`/players/${session.user.playerId}`} className="home-btn primary">
                    Ver mi perfil <LuArrowRight />
                  </Link>
                )}
                <Link href="/tournaments" className="home-btn ghost">
                  Torneos
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1>Tu circuito de tenis, con ranking de verdad</h1>
              <p>
                Seguí cada torneo, sumá puntos por cada partido y fase, y escalá posiciones contra
                el resto del club.
              </p>
              <div className="home-hero-actions">
                <Link href="/auth/signin" className="home-btn primary">
                  Iniciar sesión <LuArrowRight />
                </Link>
                <Link href="/leaderboard" className="home-btn ghost">
                  Ver ranking
                </Link>
              </div>
            </>
          )}
        </div>

        {loggedIn && me ? (
          <dl className="home-hero-stats">
            <div>
              <dt>Victorias</dt>
              <dd>{me.wins}</dd>
            </div>
            <div>
              <dt>Derrotas</dt>
              <dd>{me.losses}</dd>
            </div>
            <div>
              <dt>% victorias</dt>
              <dd>{winRate}%</dd>
            </div>
            <div>
              <dt>Títulos</dt>
              <dd>{me.titles}</dd>
            </div>
          </dl>
        ) : (
          data && (
            <dl className="home-hero-stats">
              <div>
                <dt>
                  <LuUsers /> Jugadores
                </dt>
                <dd>{data.counts.players}</dd>
              </div>
              <div>
                <dt>
                  <LuTrophy /> Torneos
                </dt>
                <dd>{data.counts.tournaments}</dd>
              </div>
              <div>
                <dt>
                  <LuSwords /> Partidos
                </dt>
                <dd>{data.counts.matches}</dd>
              </div>
            </dl>
          )
        )}
      </section>

      <RankingCarousel
        myName={me?.name}
        myGender={me ? (me.gender === 'FEMALE' ? 'female' : 'male') : undefined}
      />

      <div className="home-cards">
        {data?.lastTournament && <LastTournament data={data.lastTournament} />}
        {loggedIn && me?.lastMatch && (
          <div className="home-card">
            <p className="eyebrow">Tu último partido</p>
            <h3>
              <span className={`home-result ${me.lastMatch.won ? 'win' : 'loss'}`}>
                {me.lastMatch.won ? 'Victoria' : 'Derrota'}
              </span>{' '}
              vs {me.lastMatch.opponent}
            </h3>
            <p className="home-card-score">{me.lastMatch.score}</p>
            <p className="home-card-meta">
              {[me.lastMatch.tournamentName, me.lastMatch.stage].filter(Boolean).join(' · ')}
            </p>
            {me.lastMatch.tournamentId && (
              <Link href={`/tournaments/${me.lastMatch.tournamentId}`} className="home-link">
                Ver torneo <LuArrowRight />
              </Link>
            )}
          </div>
        )}
      </div>

      {loggedIn ? (
        <section className="home-section">
          <p className="eyebrow">Accesos rápidos</p>
          <div className="home-quick">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label} <LuArrowRight />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="home-section">
          <p className="eyebrow">Cómo funciona</p>
          <div className="home-steps">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="home-card">
                <span className="home-step-number">{i + 1}</span>
                <h3>{step.title}</h3>
                <p className="home-card-meta">{step.text}</p>
              </div>
            ))}
          </div>
          <p className="home-footnote">
            <Link href="/information" className="home-link">
              Conocé las reglas y la puntuación <LuArrowRight />
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}
