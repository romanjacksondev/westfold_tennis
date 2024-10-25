import LoadingComponent from "components/Loader";
import RankingCard from "components/RankingCard";
import { format, subMonths } from "date-fns";
import PropTypes from "prop-types";

const LeaderboardTemplate = ({ leaderboard }) => {

  const today = new Date();

  // Calcular la fecha hace 12 meses
  const twelveMonthsAgo = subMonths(today, 12);

  // Formatear las fechas
  const todayFormatted = format(today, "dd/MM/yyyy");
  const twelveMonthsAgoFormatted = format(twelveMonthsAgo, "dd/MM/yyyy");

  if (leaderboard.length === 0) {
    return <LoadingComponent size="large" />;
  }
  console.log("leadernoard: ", leaderboard)
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg rounded-lg bg-rolandGarrosOrange  p-2 lg:p-10 place-items-center">

        {leaderboard.map((player, i) => (
          <RankingCard
            key={player.id}
            id={player.id}
            ranking={i + 1}
            points={player.points.points}
            name={player.name}
            lastname={player.lastname}
            imageUrl={`/img/avatar/${player.nickname.replace(" ", "").toLowerCase()}.jpeg`}
            nickname={player.nickname}
            pointsBreakdown={player.points.breakdown}
          />
        ))
        }
      </div>
      <p className="text-black text-lg lg:text-2xl mt-6">
        * Desde {twelveMonthsAgoFormatted} hasta {todayFormatted}
      </p>
    </>
  );
};

LeaderboardTemplate.propTypes = {
  leaderboard: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default LeaderboardTemplate;
