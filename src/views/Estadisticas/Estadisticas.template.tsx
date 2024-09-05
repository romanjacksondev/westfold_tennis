import PropTypes from 'prop-types';
import HeadTemplate from './components/Head.template';

const EstadisticasTemplate = ({ h2h }) => {

  return (
    <>
      <HeadTemplate h2h={h2h}></HeadTemplate>
    </>
  )
}

EstadisticasTemplate.propTypes = {
  h2h: PropTypes.shape({}).isRequired
};

export default EstadisticasTemplate