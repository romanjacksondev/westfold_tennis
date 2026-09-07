import { Spinner } from 'flowbite-react';
// import LoadingComponent from 'components/Loader';
// import RankingCard from 'components/RankingCard';
// import { format, subMonths } from 'date-fns';

export type LeaderboardEntry = {
  key: string;
  value: {
    points: number;
    breakdown: { tournament: string; points: number }[];
  };
};

const LeaderboardTemplate = ({ leaderboard, rankingMode, loading, error }: { leaderboard: LeaderboardEntry[]; rankingMode: string; setRankingMode?: (mode: string) => void; loading: boolean; error: boolean }) => {
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

      {loading ? (
        <Spinner aria-label="Default status example" />
      ) : error ? (
        <div className="empty-state">No se pudo cargar el leaderboard.</div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">No hay resultados para este período.</div>
      ) : (
        <main className="leaderboard-page">
          <header className="leaderboard-header">
            <div>
              <p className="eyebrow">Clasificación</p>
              <h1>Leaderboard</h1>
              <p className="muted">Rendimiento acumulado del circuito.</p>
            </div>
            <div className="status-pill"><span /> {rankingMode === 'calendar' ? 'Año calendario' : 'Últimos 12 meses'}</div>
          </header>
          <section className="leaderboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Posiciones</p>
                <h2>Ranking de jugadores</h2>
              </div>
            </div>
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead><tr><th>Pos.</th><th>Jugador</th><th>Torneos</th><th>Puntos</th></tr></thead>
                <tbody>{leaderboard.map((player, index) => <tr key={player.key}><td className="leaderboard-position">{index + 1}</td><td className="leaderboard-player">{player.key}</td><td>{player.value.breakdown.length}</td><td className="leaderboard-points">{player.value.points}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </main>
      )}
    </>
  );
};

export default LeaderboardTemplate;
