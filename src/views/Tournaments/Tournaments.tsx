import { useSelectors } from 'store/selectors'
import { useActions } from 'store/actions'
import { useEffect, useState } from 'react';
import TournamentsTemplate from './Tournaments.template';

const TournamentsView = () => {
  const { getTournaments } = useActions();
  const { tournaments } = useSelectors()
  const [tournamentsList, setTournamentsList] = useState([])

  useEffect(() => {
    const getTournamentsData = async () => {
      await getTournaments()
    }
    getTournamentsData()
  }, [])

  useEffect(() => {
    if (tournaments?.length) {
      setTournamentsList(tournaments)
    }
  }, [tournaments])


  return (
    <TournamentsTemplate tournamentsList={tournamentsList} />
  );
};

export default TournamentsView;
