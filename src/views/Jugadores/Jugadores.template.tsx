import { TextBodyXs, TextHeadingH4 } from 'components/Text';
import Link from 'next/link';
import PropTypes from 'prop-types';

const JugadoresTemplate = ({ players }) => {

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
    };

    return (
        <>
            <TextHeadingH4>Jugadores</TextHeadingH4>
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Nombre </th>
                        <th className={Styles.ThStyle}> Apodo </th>
                        {/* <th className={Styles.ThStyle}> Apellido </th>
                        <th className={Styles.ThStyle}> Telefono </th> */}
                        <th className={Styles.ThStyle}> Mail </th>
                        <th className={Styles.ThStyle}></th>
                    </tr>
                </thead>

                <tbody className="text-center">
                    {players.map((player) => (
                        <tr key={player.id}>
                            <td className={Styles.TdStyle}>
                                {player.name}
                            </td>
                            <td className={Styles.TdStyle}>
                                {player.nickname}
                            </td>
                            <td className={Styles.TdStyle}>
                                {player.lastname}
                            </td>
                            {/* <td className={Styles.TdStyle}>
                                {player.phone}
                            </td>
                            <td className={Styles.TdStyle}>
                                {player.mail}
                            </td>                             */}
                            <td className={Styles.TdStyle}>
                            <Link href={`/jugadores/${player.id}`}>
                                <TextBodyXs className='font-bold'>Estadisticas</TextBodyXs>
                            </Link>
                            </td>                                                                                    
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

JugadoresTemplate.propTypes = {
    players: PropTypes.arrayOf(
        PropTypes.shape({})
    ).isRequired
};

export default JugadoresTemplate