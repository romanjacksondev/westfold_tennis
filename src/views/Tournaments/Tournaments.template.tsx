import { format } from 'date-fns';
import Link from 'next/link';
import { Headline } from 'components/Text';
import PropTypes from 'prop-types';

const TournamentsTemplate = ({ tournamentsList }) => {

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
    };

    if(tournamentsList.length == 0) {
        return (
            "LOADING"
        )
    }

console.info(tournamentsList)

    return (
        <>
            <Headline >Historial de torneos</Headline> 
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
                    {tournamentsList.length > 0 && tournamentsList.map((tournament) => (
                        <tr key={tournament.id}>
                            <td className={Styles.TdStyle}>{tournament.name}</td>
                            <td className={Styles.TdStyle}>{tournament.winner.name}</td>
                            <td className={Styles.TdStyle}>{tournament.venue.points}</td>
                            <td className={Styles.TdStyle}>
                                {format(tournament.date, 'dd/MM/yyyy')}
                            </td>
                            <td className={Styles.TdStyle}>
                                <Link href={`/torneos/${tournament.id}`}>Ver Detalles</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

TournamentsTemplate.propTypes = {
    tournamentsList: PropTypes.arrayOf( // Especifica que es una lista de objetos
        PropTypes.shape({
            // name: PropTypes.string.isRequired, // Define las propiedades del objeto
        })
    ).isRequired, // La prop 'tournamentsList' es requerida
};

export default TournamentsTemplate