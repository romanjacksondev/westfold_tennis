import { TextHeadingH1 } from "components/Text";

const PartidosTemplate = ({ matchesList }) => {

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
    };
    // console.log("matchesList.length en template: " + matchesList.length)

    const gamesPerSet = matchesList.reduce((result, match) => {

        //  console.log("inside  match content: " + JSON.stringify(match))

        match.sets.forEach((set) => {
            const gamesCount = {}
            set.games.forEach((game) => {
                const winnerId = game.winnerId
                if (!gamesCount[winnerId]) {
                    gamesCount[winnerId] = 0
                }
                gamesCount[winnerId]++
            });

            if (!result[set.id]) {
                result[set.id] = gamesCount
            }
        });
        return result
    }, {});

    const calculatePlayerStats = (matches) => {
        const playerStats = {};

        matches.forEach(match => {
            const { winnerId, player1Id, player2Id, sets } = match;

            // Inicializa los jugadores en el objeto playerStats si no existen
            if (!playerStats[player1Id]) {
                playerStats[player1Id] = {
                    id: player1Id,
                    name: match.player1?.name || 'Unknown',
                    matchesWon: 0,
                    matchesLost: 0,
                    gamesWon: 0,
                    gamesLost: 0
                };
            }

            if (!playerStats[player2Id]) {
                playerStats[player2Id] = {
                    id: player2Id,
                    name: match.player2?.name || 'Unknown',
                    matchesWon: 0,
                    matchesLost: 0,
                    gamesWon: 0,
                    gamesLost: 0
                };
            }

            // Determina el resultado del partido para cada jugador
            const matchResult = (winnerId === player1Id) ? player1Id : player2Id;
            const losingPlayer = (winnerId === player1Id) ? player2Id : player1Id;

            // Incrementa las estadísticas de los jugadores
            playerStats[matchResult].matchesWon += 1;
            playerStats[losingPlayer].matchesLost += 1;

            sets.forEach(set => {
                const { games } = set;

                games.forEach(game => {
                    const { winnerId: gameWinnerId } = game;

                    if (!playerStats[gameWinnerId]) {
                        playerStats[gameWinnerId] = {
                            id: gameWinnerId,
                            name: gameWinnerId === player1Id ? match.player1?.name : match.player2?.name,
                            matchesWon: 0,
                            matchesLost: 0,
                            gamesWon: 0,
                            gamesLost: 0
                        };
                    }

                    playerStats[gameWinnerId].gamesWon += 1;

                    const gameLoserId = (gameWinnerId === player1Id) ? player2Id : player1Id;

                    if (!playerStats[gameLoserId]) {
                        playerStats[gameLoserId] = {
                            id: gameLoserId,
                            name: gameLoserId === player1Id ? match.player1?.name : match.player2?.name,
                            matchesWon: 0,
                            matchesLost: 0,
                            gamesWon: 0,
                            gamesLost: 0
                        };
                    }

                    playerStats[gameLoserId].gamesLost += 1;
                });
            });
        });

        // Convierte el objeto playerStats en un array
        const statsArray = Object.values(playerStats);

        // Ordena el array por cantidad de partidos ganados, diferencia de juegos y juegos ganados
        statsArray.sort((a, b) => {
            // Primero, ordenar por cantidad de partidos ganados en orden descendente
            if (b.matchesWon !== a.matchesWon) {
                return b.matchesWon - a.matchesWon;
            }

            // Luego, ordenar por diferencia entre juegos ganados y perdidos en orden descendente
            const diffA = a.gamesWon - a.gamesLost;
            const diffB = b.gamesWon - b.gamesLost;
            if (diffB !== diffA) {
                return diffB - diffA;
            }

            // Finalmente, ordenar por cantidad de juegos ganados en orden descendente
            return b.gamesWon - a.gamesWon;
        });

        return statsArray;
    };


    const stats = calculatePlayerStats(matchesList);
    console.log(stats)
    if (matchesList.length == 0) {
        return (
            "LOADING"
        )
    }

    return (

        <>
            <TextHeadingH1>{matchesList[0].tournament.name}</TextHeadingH1>
            <TextHeadingH1>Campeon:  {matchesList[0].tournament.winner.name}</TextHeadingH1>
            {/* <AddTournament></AddTournament> */}

            <TextHeadingH1>Resumen del torneo</TextHeadingH1>
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Jugador </th>
                        <th className={Styles.ThStyle}> Partidos Ganados </th>
                        <th className={Styles.ThStyle}> Partidos Perdidos </th>
                        <th className={Styles.ThStyle}> Games Ganados </th>
                        <th className={Styles.ThStyle}> Games Perdidos </th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {stats.map((stat) => (
                        <tr key={stat.id}>
                            <td className={Styles.TdStyle}>{stat.name}</td>
                            <td className={Styles.TdStyle}>{stat.matchesWon}</td>
                            <td className={Styles.TdStyle}>{stat.matchesLost}</td>
                            <td className={Styles.TdStyle}>{stat.gamesWon}</td>
                            <td className={Styles.TdStyle}>{stat.gamesLost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <TextHeadingH1>Partidos</TextHeadingH1>
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Jugador </th>
                        <th className={Styles.ThStyle}> Resultado </th>
                        <th className={Styles.ThStyle}> Jugador </th>
                    </tr>
                </thead>

                <tbody className="text-center">
                    {matchesList.map((match) => (
                        <tr key={match.id}>
                            <td className={Styles.TdStyle}>{match.player1.name}</td>
                            <td className={Styles.TdStyle}>{
                                match.sets.map((set) => {
                                    const points1 = gamesPerSet[set.id][match.player1Id] === undefined ? 0 : gamesPerSet[set.id][match.player1Id];
                                    const points2 = gamesPerSet[set.id][match.player2Id] === undefined ? 0 : gamesPerSet[set.id][match.player2Id];
                                    return `${points1} - ${points2}`
                                })}
                            </td>
                            <td className={Styles.TdStyle}>{match.player2.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default PartidosTemplate