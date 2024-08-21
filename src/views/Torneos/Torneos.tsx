import { useSelectors } from 'store/selectors'
import { useActions } from 'store/actions'
import { useEffect, useState } from 'react';
import TorneosTemplate from './Torneos.template';

const TorneosView = () => {
  const { getTournaments } = useActions();
  const { tournaments } = useSelectors()
  const [torneosList, setTorneosList] = useState([])

   console.log("desde Store: " + JSON.stringify(tournaments))

  useEffect(() => {
    const getTournamentsData = async () => {
      await getTournaments()
    }
    getTournamentsData()
  }, [])

  useEffect(() => {
 console.log("tournaments: " + JSON.stringify(tournaments))
 console.log("tournaments size: " + tournaments?.length)
    if (tournaments?.length) {
       console.log("ENTREEE")
      setTorneosList(tournaments)
    }
  }, [tournaments])


  return (
    <TorneosTemplate torneosList={torneosList}></TorneosTemplate>
  );
};

export default TorneosView;
