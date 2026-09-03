import CardComponent from '@/components/Card/Card.template';
import { Spinner } from 'flowbite-react';
// import LoadingComponent from 'components/Loader';
// import RankingCard from 'components/RankingCard';
// import { format, subMonths } from 'date-fns';

const LeaderboardTemplate = ({ leaderboard, rankingMode, setRankingMode /*hasTournaments*/ }) => {
  // const handleOnClick = (value) => {
  //   setRankingMode(value);
  // };

  // console.log("leaderboard: ", leaderboard)
  return (
    <>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg rounded-lg  p-2 lg:p-10 place-items-center">
        <Button
          onClick={() => handleOnClick('year')}
          className="w-40"
          width="fixed"
          variant={rankingMode == 'year' ? 'filled' : 'outline'}
        >
          Ranking ATP
        </Button>
        <Button
          onClick={() => handleOnClick('calendar')}
          className="w-40"
          width="fixed"
          variant={rankingMode == 'calendar' ? 'filled' : 'outline'}
        >
          Carrera a Turin
        </Button>
      </div> */}

      {!leaderboard || leaderboard.length === 0 ? (
        <Spinner aria-label="Default status example" />
      ) : (
        <>
          <div
            className={rankingMode == 'calendar' ? 'bg-wimbledonGreen' : 'bg-rolandGarrosOrange'}
          >
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 shadow-lg rounded-lg   p-2 lg:p-10">
              {leaderboard.map((player, i) => (
                // <RankingCard
                //   key={player.id}
                //   id={player.id}
                //   ranking={i + 1}
                //   points={player.points.points}
                //   name={player.name}
                //   lastname={player.lastname}
                //   imageUrl={`/img/avatar/${player.nickname.replace(' ', '').toLowerCase()}.jpeg`}
                //   nickname={player.nickname}
                //   pointsBreakdown={player.points.breakdown}
                // />
                <CardComponent
                  key={player.id}
                  id={player.id}
                  name={player.name}
                  lastname={player.lastname}
                  imageUrl={''}
                  nickname={player.nickname}
                />
              ))}
            </div>
          </div>
          {/* <p className="text-black text-lg lg:text-2xl mt-6">
            * Desde {rankingMode == 'year' ? twelveMonthsAgoFormatted : firstDayOfYear} hasta{' '}
            {todayFormatted}
          </p> */}
        </>
      )}
    </>
  );
};

export default LeaderboardTemplate;
