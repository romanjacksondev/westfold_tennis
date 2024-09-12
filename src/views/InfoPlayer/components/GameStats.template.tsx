import { TextHeadingH4 } from 'components/Text';
import { formatNumber } from 'lib/helpers';
import PropTypes from 'prop-types';

const Styles = {
    ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l text-center`,
    TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l text-center`,
};

const GameTemplate = ({ stats }) => {
    return (
        <>
            <TextHeadingH4>Resumen Games</TextHeadingH4>
            <table>
                <thead>
                    <tr>
                        <th className={Styles.ThStyle}>Jugados</th>
                        <th className={Styles.ThStyle}>Ganados</th>
                        <th className={Styles.ThStyle}>Perdidos</th>
                        <th className={Styles.ThStyle}>% victorias</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={Styles.TdStyle}>{stats.gamesPlayed}</td>
                        <td className={Styles.TdStyle}>{stats.gamesWon}</td>
                        <td className={Styles.TdStyle}>{stats.gamesLost}</td>
                        <td className={Styles.TdStyle}>{formatNumber(stats.gamesWon / stats.gamesPlayed, 2)}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

GameTemplate.propTypes = {
    stats: PropTypes.shape({
        gamesPlayed: PropTypes.number,
        gamesWon: PropTypes.number,
        gamesLost: PropTypes.number,
    }).isRequired
};

export default GameTemplate