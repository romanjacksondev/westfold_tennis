/** @format */

import PropTypes from "prop-types";
import HeadTemplate from "./components/Head.template";
import ChampionshipsTemplate from "./components/Championships.template";
import MatchHistory from "./components/MatchHistory";
import { Button } from "components/Button";
import { useState } from "react";

const EstadisticasTemplate = ({ h2h, championships }) => {

  const [showH2H, setShowH2H] = useState(true)
  const [showChampionships, setShowChampionships] = useState(false)
  const [showMatchHistory, setMatchHistory] = useState(false)

  const handleOnClick = (value) => {
    if (value == 'H2H') {
      setShowH2H(true)
      setShowChampionships(false)
      setMatchHistory(false)
    }
    if (value == 'Championships') {
      setShowH2H(false)
      setShowChampionships(true)
      setMatchHistory(false)
    }
    if (value == 'MatchHistory') {
      setShowH2H(false)
      setShowChampionships(false)
      setMatchHistory(true)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shadow-lg rounded-lg  p-2 lg:p-10 place-items-center">
        <Button onClick={() => handleOnClick('H2H')} className="w-40" width="fixed" variant={showH2H ? "filled" : "outline"}>
          H2H
        </Button>
        <Button onClick={() => handleOnClick('Championships')} className="w-40" width="fixed" variant={showChampionships ? "filled" : "outline"}>
          Torneos
        </Button>
        <Button onClick={() => handleOnClick('MatchHistory')} className="w-40" width="fixed" variant={showMatchHistory ? "filled" : "outline"}>
          Historial partidos
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        {showH2H && <HeadTemplate h2h={h2h} />}
        {showChampionships && <ChampionshipsTemplate championships={championships} />}
        {showMatchHistory && <MatchHistory></MatchHistory>}
      </div>
    </>


  );
};

EstadisticasTemplate.propTypes = {
  h2h: PropTypes.shape({}).isRequired,
  championships: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default EstadisticasTemplate;
