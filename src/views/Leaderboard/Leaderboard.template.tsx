import { Button } from "components/Button";
import LoadingComponent from "components/Loader";
import RankingCard from "components/RankingCard";
import { format, subMonths } from "date-fns";
import PropTypes from "prop-types";

const LeaderboardTemplate = ({ leaderboard, rankingMode, setRankingMode, hasTournaments }) => {

  const today = new Date();

  // Calcular la fecha hace 12 meses
  const twelveMonthsAgo = subMonths(today, 12);

  // Formatear las fechas
  const todayFormatted = format(today, "dd/MM/yyyy");
  const twelveMonthsAgoFormatted = format(twelveMonthsAgo, "dd/MM/yyyy");
  const firstDayOfYear = format(new Date(today.getFullYear(), 0, 1), "dd/MM/yyyy");

  const handleOnClick = (value) => {
    setRankingMode(value)
  }

  // console.log("leaderboard: ", leaderboard)
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg rounded-lg  p-2 lg:p-10 place-items-center">
        <Button onClick={() => handleOnClick('year')} className="w-40" width="fixed" variant={rankingMode == 'year' ? "filled" : "outline"}>
          Ranking ATP
        </Button>
        <Button onClick={() => handleOnClick('calendar')} className="w-40" width="fixed" variant={rankingMode == 'calendar' ? "filled" : "outline"}>
          Carrera a Turin
        </Button>
      </div>

      {!hasTournaments ? (<LoadingComponent size="large" />) :
        (
          <>
            <div className={rankingMode == 'calendar' ? "bg-wimbledonGreen" : "bg-rolandGarrosOrange"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg rounded-lg p-2 lg:p-10 place-items-center" >
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
            </div>
            <p className="text-black text-lg lg:text-2xl mt-6">
              * Desde {rankingMode == 'year' ? twelveMonthsAgoFormatted : firstDayOfYear} hasta {todayFormatted}
            </p>
          </>
        )
      }
    </>
  );
};

LeaderboardTemplate.propTypes = {
  leaderboard: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rankingMode: PropTypes.string,
  setRankingMode: PropTypes.func,
  hasTournaments: PropTypes.bool
};

export default LeaderboardTemplate;
