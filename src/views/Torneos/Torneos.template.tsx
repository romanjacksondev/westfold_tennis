import { format } from 'date-fns';
import AddTournament from './components/AddTournament';

const TorneosTemplate = ({ torneosList }) => {

    const Styles = {
        // ThStyle: `w-1/6 min-w-[160px] border-l border-transparent py-4 px-3 text-lg font-semibold lg:py-7 lg:px-4`,
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
        // TdStyle: `border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-5 px-2 text-center text-base font-medium text-dark`,
        // TdButton: `inline-block px-6 py-2 border rounded border-primary text-primary hover:bg-primary hover:text-white`,
    };
console.info(torneosList)
     console.log("torneosList.length en template: " + torneosList.length )
     console.log("torneos en template: " + JSON.stringify(torneosList) )
    return (
        <>
            <AddTournament></AddTournament>
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Nombre </th>
                        <th className={Styles.ThStyle}> Ganador </th>
                        <th className={Styles.ThStyle}> Puntos </th>
                        <th className={Styles.ThStyle}> Fecha </th>
                        <th className={Styles.ThStyle}> </th>
                    </tr>
                </thead>

                <tbody className="text-center">
                    {torneosList.length > 0 && torneosList.map((tournament) => (
                        <tr key={tournament.id}>
                            <td className={Styles.TdStyle}>{tournament.name}</td>
                            <td className={Styles.TdStyle}>{tournament.winner.name}</td>
                            <td className={Styles.TdStyle}>{tournament.venue.points}</td>
                            <td className={Styles.TdStyle}>
                                {format(tournament.date, 'dd/MM/yyyy')}
                            </td>
                            <td className={Styles.TdStyle}>
                                Ver Detalles
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>

    )

}

export default TorneosTemplate