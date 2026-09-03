import { Card } from 'flowbite-react';
import Image from 'next/image';
import type { CardComponentType } from './types/CardComponentType';

export default function CardComponent({
  id,
  name,
  lastname,
  imageUrl,
  nickname,
  stats,
}: CardComponentType) {
  return (
    <Card className="player-card" key={id}>
      <div className="player-card-body">
        <Image
          alt={`${name} ${lastname} image`}
          height="96"
          src={imageUrl}
          width="96"
          className="player-avatar"
        />
        <p className="player-card-name">{name} {lastname}</p>
        <p className="player-card-nickname">“{nickname}”</p>
        <div className="player-card-stats">
          <span><strong>{(stats?.matchesWon ?? 0) + (stats?.matchesLost ?? 0)}</strong> partidos</span>
          <span><strong>{stats && stats.matchesWon + stats.matchesLost > 0 ? Math.round((stats.matchesWon / (stats.matchesWon + stats.matchesLost)) * 100) : 0}%</strong> victorias</span>
          <span><strong>{(stats?.gamesWon ?? 0) - (stats?.gamesLost ?? 0) >= 0 ? '+' : ''}{(stats?.gamesWon ?? 0) - (stats?.gamesLost ?? 0)}</strong> games</span>
        </div>
      </div>
    </Card>
  );
}
