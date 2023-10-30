import React from "react";
import NewSetModal from "../set/NewSetModal";

const TdStyle = {
  ThStyle: `w-1/6 min-w-[160px] border-l border-transparent py-4 px-3 text-lg font-semibold lg:py-7 lg:px-4`,
  TdStyle: `border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-5 px-2 text-center text-base font-medium text-dark`,
  TdButton: `inline-block px-6 py-2 border rounded border-primary text-primary hover:bg-primary hover:text-white`,
};

const colorVariants = {
  winner: `border-b border-l border-[#E8E8E8] bg-green-100 py-5 px-2 text-center text-base font-medium text-dark`,
  loser: `border-b border-l border-[#E8E8E8] bg-red-100 py-5 px-2 text-center text-base font-medium text-dark`,
};

const MatchesTable = ({ records }) => {
  const gamesPerSet = records.reduce((result, match) => {
    match.sets.forEach((set) => {
      const gamesCount = {};

      set.games.forEach((game) => {
        debugger;
        const winnerId = game.winnerId;
        if (!gamesCount[winnerId]) {
          gamesCount[winnerId] = 0;
        }
        gamesCount[winnerId]++;
      });

      if (!result[set.id]) {
        result[set.id] = gamesCount;
      }
    });
    console.log(result);
    return result;
  }, {});

  console.log(gamesPerSet);

  if (records?.length === 0) {
    return <></>;
  } else {
    return (
      <section className="pt-10 bg-white">
        <div className="container">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full ">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="text-center bg-primary">
                    <tr>
                      <th className={TdStyle.ThStyle}> Jugador 1</th>
                      <th className={TdStyle.ThStyle}> Resultado </th>
                      <th className={TdStyle.ThStyle}> Jugador 2 </th>
                      {/* <th className={TdStyle.ThStyle}></th> */}
                    </tr>
                  </thead>

                  <tbody>
                    {records?.map((match) => (
                      <tr key={match.id}>
                        <td
                          className={`${
                            colorVariants[
                              match.winnerId === match.player1Id
                                ? "winner"
                                : "loser"
                            ]
                          }`}
                        >
                          {match.player1.name}
                        </td>
                        <td className={TdStyle.TdStyle}>
                          {match.sets.map(
                            (set) =>
                              `${gamesPerSet[set.id][match.player1Id]} -
                            ${gamesPerSet[set.id][match.player2Id]}`
                          )}
                        </td>
                        <td
                          className={`${
                            colorVariants[
                              match.winnerId === match.player2Id
                                ? "winner"
                                : "loser"
                            ]
                          }`}
                        >
                          {match.player2.name}
                        </td>
                        {/* <td className={TdStyle.TdStyle}>
                          <NewSetModal
                            matchId={match.id}
                            player1Id={match.player1Id}
                            player2Id={match.player2Id}
                          ></NewSetModal>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default MatchesTable;
