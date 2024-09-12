import { TextHeadingH4 } from 'components/Text';
import { formatNumber } from 'lib/helpers';
import PropTypes from 'prop-types';

const Styles = {
    ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l text-center`,
    TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l text-center`,
};

const SetTemplate = ({ stats }) => {
    return (
        <>
            <TextHeadingH4>Resumen Sets</TextHeadingH4>
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
                        <td className={Styles.TdStyle}>{stats.setsPlayed}</td>
                        <td className={Styles.TdStyle}>{stats.setsWon}</td>
                        <td className={Styles.TdStyle}>{stats.setsLost}</td>
                        <td className={Styles.TdStyle}>{formatNumber(stats.setsWon / stats.setsLost, 2)}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

SetTemplate.propTypes = {
    stats: PropTypes.shape({
        setsPlayed: PropTypes.number,
        setsWon: PropTypes.number,
        setsLost: PropTypes.number,
    }).isRequired
};

export default SetTemplate