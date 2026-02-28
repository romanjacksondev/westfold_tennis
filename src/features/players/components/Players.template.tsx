import { TennisPlayerProps } from '../types/Players';

const JugadoresTemplate = ({ players }: { players: TennisPlayerProps[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg rounded-lg bg-rolandGarrosOrange p-2 lg:p-10">
      {players.map(
        (player) => `${player.name}   ${player.lastname}`,
        // <PlayerCard
        //   key={player.id}
        //   id={player.id}
        //   name={player.name}
        //   lastname={player.lastname}
        //   imageUrl={`/img/avatar/${player.nickname.replace(" ", "").toLowerCase()}.jpeg`}
        //   nickname={player.nickname}
        // />
      )}
    </div>
  );
};

export default JugadoresTemplate;
