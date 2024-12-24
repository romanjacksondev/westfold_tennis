/** @format */

import PropTypes from "prop-types";
import HeadTemplate from "./components/Head.template";
import ChampionshipsTemplate from "./components/Championships.template";
import MatchHistory from "./components/MatchHistory";

const EstadisticasTemplate = ({ h2h, championships }) => {
  return (
    <div className="flex flex-col gap-8">
      {/* <HeadTemplate h2h={h2h} />
      <ChampionshipsTemplate championships={championships} /> */}
      <MatchHistory></MatchHistory>
    </div>
  );
};

EstadisticasTemplate.propTypes = {
  h2h: PropTypes.shape({}).isRequired,
  championships: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default EstadisticasTemplate;
