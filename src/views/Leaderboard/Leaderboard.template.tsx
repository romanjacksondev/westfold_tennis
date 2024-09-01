import { format, subMonths } from 'date-fns';

const LeaderboardTemplate = ({ leaderboard }) => {


    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
    };

    const today = new Date();

    // Calcular la fecha hace 12 meses
    const twelveMonthsAgo = subMonths(today, 12);
    
    // Formatear las fechas
    const todayFormatted = format(today, 'dd/MM/yyyy');
    const twelveMonthsAgoFormatted = format(twelveMonthsAgo, 'dd/MM/yyyy');
    return (
        <>
        Desde {twelveMonthsAgoFormatted} Hasta {todayFormatted}
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Posicion </th>
                        <th className={Styles.ThStyle}> Nombre </th>
                        <th className={Styles.ThStyle}> Puntos </th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {leaderboard.length > 0 && leaderboard.map((lead, index) => (
                        <tr key={index}>
                            <td className={Styles.TdStyle}>{index + 1}</td>
                            <td className={Styles.TdStyle}>{lead.key}</td>
                            <td className={Styles.TdStyle}>{lead.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )

}
export default LeaderboardTemplate