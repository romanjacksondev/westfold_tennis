import PlayerCard from "components/PlayerCard";
import { format, subMonths } from "date-fns";
import { TennisPlayerProps } from "views/Jugadores/Jugadores.template";

const LeaderboardTemplate = ({
  leaderboard,
}: {
  leaderboard: TennisPlayerProps[];
}) => {
  const Styles = {
    ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
    TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
  };

  const today = new Date();

  // Calcular la fecha hace 12 meses
  const twelveMonthsAgo = subMonths(today, 12);

  // Formatear las fechas
  const todayFormatted = format(today, "dd/MM/yyyy");
  const twelveMonthsAgoFormatted = format(twelveMonthsAgo, "dd/MM/yyyy");

  if (leaderboard.length == 0) {
    return "LOADING";
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg rounded-lg bg-rolandGarrosOrange  p-2 lg:p-10 place-items-center">
        {leaderboard.map((player, i) => (
          <PlayerCard
            key={player.id}
            id={player.id}
            ranking={i + 1}
            points={player.points}
            name={player.name}
            lastname={player.lastname}
            imageUrl={`/img/avatar/${player.nickname.replace(" ", "").toLowerCase()}.jpeg`}
            nickname={player.nickname}
          />
        ))}
      </div>
      <p className="text-black text-lg lg:text-2xl mt-6">
        * Desde {twelveMonthsAgoFormatted} hasta {todayFormatted}
      </p>
    </>
  );
};
export default LeaderboardTemplate;
