import PropTypes from 'prop-types';
import ChampionshipsTemplate from "views/Estadisticas/components/Championships.template";
import StatsTemplate from './components/Stats.template';

const InfoPlayerTemplate = ({ championships, stats }) => {
    return (
        <>
            <ChampionshipsTemplate championships={championships}></ChampionshipsTemplate>
            <StatsTemplate stats={stats}></StatsTemplate>
        </>
    )
}

InfoPlayerTemplate.propTypes = {
    championships: PropTypes.arrayOf(
        PropTypes.shape({})
    ).isRequired,
    stats: PropTypes.shape({}).isRequired
};

export default InfoPlayerTemplate