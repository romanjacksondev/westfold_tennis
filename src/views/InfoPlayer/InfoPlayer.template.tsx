import PropTypes from 'prop-types';
import ChampionshipsTemplate from "views/Estadisticas/components/Championships.template";

const InfoPlayerTemplate = ({championships}) => {
    return (
        <ChampionshipsTemplate championships={championships}></ChampionshipsTemplate>
    )
}

InfoPlayerTemplate.propTypes = {
    championships: PropTypes.arrayOf(
        PropTypes.shape({})
      ).isRequired
};

export default InfoPlayerTemplate