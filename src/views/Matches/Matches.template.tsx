import { TextHeadingH1 } from "components/Text";
import { calculatePlayerStats } from "lib/helpers";
import { Stat } from "interfaces";
import PropTypes from 'prop-types';

const PartidosTemplate = ({ matchesList }) => {

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
    };

    const gamesPerSet = matchesList.reduce((result, match) => {
        if (match.sets) {
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
        }

        return result
    }, {});

    const stats: Stat[] = calculatePlayerStats(matchesList);
    // console.log(stats)
    if (matchesList.length == 0 || !matchesList[0].tournament) {
        return (
            <>
                No se encontraron partidos
            </>
        )
    }

    return (
        <>
            <TextHeadingH1>{matchesList[0].tournament.name}</TextHeadingH1>
            <TextHeadingH1>Campeon:  {matchesList[0].tournament.winner.name}</TextHeadingH1>
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

PartidosTemplate.propTypes = {
    matchesList: PropTypes.arrayOf(
        PropTypes.shape({
            tournament: PropTypes.shape({
                name: PropTypes.string.isRequired,
                winner: PropTypes.shape({
                    name: PropTypes.string.isRequired,
                })
            }).isRequired
        })
    ).isRequired
};

export default PartidosTemplate