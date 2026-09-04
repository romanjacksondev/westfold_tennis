'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type Counter = { played: number; won: number; lost: number; percentage: number };
type Stats = {
  player: { name: string; lastname: string | null; nickname: string | null };
  summary: { matches: Counter; sets: Counter; games: Counter & { difference: number }; titles: number };
  surfaces: { all: Array<{ name: string; played: number; won: number; lost: number; percentage: number }>; bestByPercentage: { name: string; percentage: number; played: number } | null; bestByWins: { name: string; won: number; played: number } | null };
  opponents: { mostWins: Array<{ name: string; played: number; won: number; lost: number; percentage: number }>; mostLosses: Array<{ name: string; played: number; won: number; lost: number; percentage: number }> };
  recentMatches: Array<{ id: string; opponent: string; result: string; tournament: string; surface: string | null; date: string | null; sets: string[] }>;
};

const emptyCounter = { played: 0, won: 0, lost: 0, percentage: 0 };
const fullName = (player: Stats['player']) => `${player.name} ${player.lastname ?? ''}`.trim();
const avatarPath = (nickname: string | null) => `/img/avatar/${(nickname ?? '').replaceAll(' ', '').toLowerCase()}.jpeg`;

function StatCard({ label, counter }: { label: string; counter: Counter }) {
  return <article className="player-stat-card"><p>{label}</p><strong>{counter.played}</strong><div><span>{counter.won} ganados</span><span>{counter.lost} perdidos</span></div><small>{counter.percentage}% efectividad</small></article>;
}

function ComparisonChart({ summary }: { summary: Stats['summary'] }) {
  const rows = [{ label: 'Partidos', won: summary.matches.won, lost: summary.matches.lost }, { label: 'Sets', won: summary.sets.won, lost: summary.sets.lost }, { label: 'Games', won: summary.games.won, lost: summary.games.lost }];
  const max = Math.max(...rows.flatMap((row) => [row.won, row.lost]), 1);
  return <div className="comparison-chart" aria-label="Comparación de resultados ganados y perdidos">{rows.map((row) => <div className="comparison-row" key={row.label}><strong>{row.label}</strong><div className="comparison-bars"><span className="bar-won" style={{ width: `${(row.won / max) * 100}%` }} /> <span className="bar-lost" style={{ width: `${(row.lost / max) * 100}%` }} /></div><small>{row.won} / {row.lost}</small></div>)}</div>;
}

function SurfaceChart({ surfaces }: { surfaces: Stats['surfaces']['all'] }) {
  if (!surfaces.length) return <p className="stats-empty">Todavía no hay partidos asociados a una superficie.</p>;
  const max = Math.max(...surfaces.map((surface) => surface.played), 1);
  return <div className="surface-chart">{surfaces.map((surface) => <div className="surface-row" key={surface.name}><div><strong>{surface.name}</strong><small>{surface.won} ganados · {surface.lost} perdidos</small></div><div className="surface-track"><span style={{ width: `${(surface.played / max) * 100}%` }}><b>{surface.percentage}%</b></span></div></div>)}</div>;
}

function OpponentList({ title, entries, empty }: { title: string; entries: Stats['opponents']['mostWins']; empty: string }) {
  return <section className="player-detail-panel"><div className="section-heading"><div><p className="eyebrow">Rivales</p><h2>{title}</h2></div></div>{entries.length ? <div className="opponent-list">{entries.map((entry) => <div className="opponent-row" key={entry.name}><div><strong>{entry.name}</strong><small>{entry.played} partidos · {entry.percentage}% de victorias</small></div><b>{entry.won} - {entry.lost}</b></div>)}</div> : <p className="stats-empty">{empty}</p>}</section>;
}

function PlayerStatsContent() {
  const params = useParams<{ id: string }>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (!params.id) return; fetch(`/api/players/${params.id}/stats`).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.message); return payload; }).then(setStats).catch((reason) => setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las estadísticas')); }, [params.id]);

  if (error) return <main className="player-stats-page"><Link className="back-link" href="/players">← Volver a jugadores</Link><section className="player-stats-state"><h1>No encontramos ese jugador</h1><p>{error}</p></section></main>;
  if (!stats) return <main className="player-stats-page"><div className="player-stats-state"><p className="eyebrow">Perfil deportivo</p><h1>Cargando estadísticas...</h1></div></main>;
  const name = fullName(stats.player);
  const recent = stats.recentMatches;
  return <main className="player-stats-page"><div className="player-stats-content"><Link className="back-link" href="/players">← Volver a jugadores</Link><header className="player-stats-header"><div className="player-identity"><Image src={avatarPath(stats.player.nickname)} alt={`Foto de ${name}`} width={120} height={120} className="player-stats-avatar" /><div><p className="eyebrow">Perfil deportivo</p><h1>{name}</h1><p className="player-stats-nickname">{stats.player.nickname ? `“${stats.player.nickname}”` : 'Jugador del circuito'}</p></div></div><div className="player-title-count"><strong>{stats.summary.titles}</strong><span>{stats.summary.titles === 1 ? 'título' : 'títulos'}</span></div></header><section className="player-stat-grid"><StatCard label="Partidos" counter={stats.summary.matches} /><StatCard label="Sets" counter={stats.summary.sets} /><StatCard label="Games" counter={stats.summary.games} /><article className="player-stat-card player-title-card"><p>Torneos ganados</p><strong>{stats.summary.titles}</strong><small>Campeonatos registrados</small></article></section><div className="player-analysis-grid"><section className="player-detail-panel"><div className="section-heading"><div><p className="eyebrow">Balance global</p><h2>Ganados y perdidos</h2></div><span className="chart-legend"><i className="legend-won" /> Ganados <i className="legend-lost" /> Perdidos</span></div><ComparisonChart summary={stats.summary} /></section><section className="player-detail-panel"><div className="section-heading"><div><p className="eyebrow">Rendimiento</p><h2>Por superficie</h2></div></div><SurfaceChart surfaces={stats.surfaces.all} /></section></div><section className="surface-highlights"><article><small>Mejor efectividad</small><strong>{stats.surfaces.bestByPercentage?.name ?? 'Sin datos'}</strong><span>{stats.surfaces.bestByPercentage ? `${stats.surfaces.bestByPercentage.percentage}% · ${stats.surfaces.bestByPercentage.played} partidos` : 'Cargá partidos para verlo'}</span></article><article><small>Más victorias</small><strong>{stats.surfaces.bestByWins?.name ?? 'Sin datos'}</strong><span>{stats.surfaces.bestByWins ? `${stats.surfaces.bestByWins.won} victorias · ${stats.surfaces.bestByWins.played} partidos` : 'Cargá partidos para verlo'}</span></article><article><small>Diferencia de games</small><strong>{stats.summary.games.difference >= 0 ? '+' : ''}{stats.summary.games.difference}</strong><span>Balance acumulado</span></article></section><div className="player-analysis-grid"><OpponentList title="Más ganados contra" entries={stats.opponents.mostWins} empty="Todavía no hay rivales registrados." /><OpponentList title="Más perdidos contra" entries={stats.opponents.mostLosses} empty="Todavía no hay derrotas registradas." /></div><section className="player-detail-panel"><div className="section-heading"><div><p className="eyebrow">Actividad reciente</p><h2>Últimos partidos</h2></div></div>{recent.length ? <div className="recent-match-list">{recent.map((match) => <div className="recent-match-row" key={match.id}><span className={`match-result ${match.result === 'Victoria' ? 'match-win' : 'match-loss'}`}>{match.result === 'Victoria' ? 'V' : 'D'}</span><div><strong>vs. {match.opponent}</strong><small>{match.tournament}{match.surface ? ` · ${match.surface}` : ''}</small></div><b>{match.sets.join(' ')}</b></div>)}</div> : <p className="stats-empty">No hay partidos para mostrar todavía.</p>}</section></div></main>;
}

export default function PlayerStatsPage() {
  return (
    <Suspense fallback={<main className="player-stats-page"><div className="player-stats-state"><p className="eyebrow">Perfil deportivo</p><h1>Cargando estadísticas...</h1></div></main>}>
      <PlayerStatsContent />
    </Suspense>
  );
}