/** @format */

import { useState, useEffect } from "react";
import EstadisticasTemplate from "./Estadisticas.template";
import { useActions } from "store/actions";

const EstadisticasView = () => {
  const { getGeneralStats } = useActions();
  const [h2h, setH2h] = useState({});
  const [championships, setChampionships] = useState([]);

  useEffect(() => {

     const getData = async () => {
       const data = await getGeneralStats();

// console.log("data:", data )

       setH2h(data.h2h);
       setChampionships(data.tournamentsByPlayer);
     };
    getData()
  }, []);

  return <EstadisticasTemplate h2h={h2h} championships={championships} />;
};

export default EstadisticasView;
