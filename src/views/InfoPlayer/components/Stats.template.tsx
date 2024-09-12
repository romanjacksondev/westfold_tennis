import PropTypes from 'prop-types';
import MatchTemplate from './MatchStats.template';
import SetTemplate from './SetStats.template';
import GameTemplate from './GameStats.template';

const StatsTemplate = ({ stats }) => {

  if (!stats.matchesPlayed) {
    return (
      "LOADING STATS"
    )
  }

  return (
    <>
      <MatchTemplate stats={stats} />
      <SetTemplate stats={stats}/>
      <GameTemplate stats={stats}/>
    </>
  )
}

StatsTemplate.propTypes = {
  stats: PropTypes.shape({
    matchesPlayed: PropTypes.number,
    matchesWon: PropTypes.number,
    matchesLost: PropTypes.number,
  }).isRequired
};

export default StatsTemplate