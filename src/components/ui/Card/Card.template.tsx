import { Card } from 'flowbite-react';
import Link from 'next/link';
import PlayerPhoto from '../PlayerPhoto/PlayerPhoto';
import type { CardComponentType } from './types/CardComponentType';

export default function CardComponent({
  id,
  name,
  lastname,
  imageUrl,
  nickname,
  stats,
}: CardComponentType) {
  const matches = (stats?.matchesWon ?? 0) + (stats?.matchesLost ?? 0);
  const sets = (stats?.setsWon ?? 0) + (stats?.setsLost ?? 0);
  const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
  return (
    <Link href={`/players/${id}`} className="player-card-link" aria-label={`Ver estadísticas de ${name} ${lastname}`}>
      <Card className="player-card" key={id}>
      <div className="player-card-body">
        <PlayerPhoto src={imageUrl} name={`${name} ${lastname}`} size={116} className="player-avatar" />
        <p className="player-card-name">{name} {lastname}</p>
        <p className="player-card-nickname">“{nickname}”</p>
        <div className="player-card-stats">
          {[
            { label: 'Partidos', played: matches, won: stats?.matchesWon ?? 0, lost: stats?.matchesLost ?? 0 },
            { label: 'Sets', played: sets, won: stats?.setsWon ?? 0, lost: stats?.setsLost ?? 0 },
          ].map((row) => (
            <div className="player-card-stat-row" key={row.label}>
              <span><strong>{row.played}</strong> {row.label} jugados</span>
              <span><strong>{percent(row.won, row.played)}%</strong> ganados</span>
              <span><strong>{percent(row.lost, row.played)}%</strong> perdidos</span>
            </div>
          ))}
        </div>
      </div>
      </Card>
    </Link>
  );
}
