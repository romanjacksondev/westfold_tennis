import { TextHeadingH4 } from 'components/Text';
import { formatNumber } from 'lib/helpers';
import PropTypes from 'prop-types';

const Styles = {
    ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l text-center`,
    TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l text-center`,
};

const MatchTemplate = ({ stats }) => {
    return (
        <>
            <TextHeadingH4>Resumen Partidos</TextHeadingH4>
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
                        <td className={Styles.TdStyle}>{stats.matchesPlayed}</td>
                        <td className={Styles.TdStyle}>{stats.matchesWon}</td>
                        <td className={Styles.TdStyle}>{stats.matchesLost}</td>
                        <td className={Styles.TdStyle}>{formatNumber(stats.matchesWon / stats.matchesPlayed, 2)}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

MatchTemplate.propTypes = {
    stats: PropTypes.shape({

        matchesPlayed: PropTypes.number,
        matchesWon: PropTypes.number,
        matchesLost: PropTypes.number,

    }).isRequired
};


export default MatchTemplate