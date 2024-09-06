import PropTypes from 'prop-types';
import HeadTemplate from './components/Head.template';
import ChampionshipsTemplate from './components/Championships.template';

const EstadisticasTemplate = ({ h2h, championships }) => {

  return (
    <>
      <HeadTemplate h2h={h2h}></HeadTemplate>
      <ChampionshipsTemplate championships={championships}></ChampionshipsTemplate>
    </>
  )
}

EstadisticasTemplate.propTypes = {
  h2h: PropTypes.shape({}).isRequired,
  championships: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired
};

export default EstadisticasTemplate