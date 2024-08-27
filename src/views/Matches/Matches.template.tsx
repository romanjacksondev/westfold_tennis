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


    return (
        <>
            {/* <AddTournament></AddTournament> */}
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Jugador </th>
                        <th className={Styles.ThStyle}> Resultado </th>
                        <th className={Styles.ThStyle}> Jugador </th>
                    </tr>
                </thead>

                <tbody className="text-center">
                    {matchesList.length > 0 && matchesList.map((match) => (
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