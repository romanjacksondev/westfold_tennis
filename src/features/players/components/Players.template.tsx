import CardComponent from '@/components/Card/Card.template';
import { TennisPlayerProps } from '../types/Players';

const PlayersTemplate = ({ players }: { players: TennisPlayerProps[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 shadow-lg rounded-lg p-2 lg:p-10">
      {players.map((player) => (
        <CardComponent
          key={player.id}
          id={player.id}
          name={player.name}
          lastname={player.lastname}
          imageUrl={`/img/avatar/${player.nickname.replace(' ', '').toLowerCase()}.jpeg`}
          nickname={player.nickname}
        />
      ))}
    </div>
  );
};

export default PlayersTemplate;
