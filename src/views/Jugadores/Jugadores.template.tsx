import PropTypes from 'prop-types';

const JugadoresTemplate = ({ players }) => {

    const Styles = {
        ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
        TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
    };

    return (
        <>
            <table className="w-full table-auto">
                <thead className="text-center bg-gray-300">
                    <tr>
                        <th className={Styles.ThStyle}> Nombre </th>
                    </tr>
                </thead>

                <tbody className="text-center">
                    {players.map((player) => (
                        <tr key={player.id}>
                            <td className={Styles.TdStyle}>
                                {player.name}
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