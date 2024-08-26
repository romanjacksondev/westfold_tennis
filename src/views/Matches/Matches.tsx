import { useSelectors } from 'store/selectors'
import { useActions } from 'store/actions'
import { useEffect, useState } from 'react';
import MatchesTemplate from './Matches.template';

const PartidosView = () => {
  const { getTournaments } = useActions();
  // const { matches } = useSelectors()
  const [partidosList, setPartidosList] = useState([])

  //  console.log("desde Store: " + JSON.stringify(tournaments))

  // useEffect(() => {
  //   const getTournamentsData = async () => {
  //     await getTournaments()
  //   }
  //   getTournamentsData()
  // }, [])

//   useEffect(() => {
// //  console.log("tournaments: " + JSON.stringify(tournaments))
// //  console.log("tournaments size: " + tournaments?.length)
//     if (tournaments?.length) {
//       setTorneosList(tournaments)
//     }
//   }, [tournaments])


  return (
    <MatchesTemplate partidosList={partidosList}></MatchesTemplate>
  );
};

export default PartidosView;
