import { useSelectors } from 'store/selectors'
import { useActions } from 'store/actions'
import { useEffect, useState } from 'react';
import MatchesTemplate from './Matches.template';
import { useRouter } from 'next/router'

const PartidosView = () => {
  const router = useRouter()
  const { getMatches } = useActions();
  const { matches } = useSelectors()
  const [matchesList, setMatchesList] = useState([])

  useEffect(() => {
    const getMatchesData = async () => {
      await getMatches(router.query.id)
    }
    getMatchesData()
  }, [])

  useEffect(() => {
    if (matches?.length) {
      setMatchesList(matches)
    }
  }, [matches])


  return (
    <MatchesTemplate matchesList={matchesList}></MatchesTemplate>
  );
};

export default PartidosView;
