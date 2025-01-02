import { useSelectors } from 'store/selectors'
import { useActions } from 'store/actions'
import { useEffect, useState } from 'react';
import MatchesTemplate from './Matches.template';
import { useRouter } from 'next/router'

const PartidosView = () => {
  const router = useRouter()
  const { getMatches, clearMatches } = useActions();
  const { matches } = useSelectors()
  const [matchesData, setMatchesData] = useState({})

  useEffect(() => {
    const getMatchesData = async () => {
      // console.log("id", router.query.id)
      await getMatches(router.query.id)
    }
    clearMatches()
    getMatchesData()

  }, [])

  useEffect(() => {
    if (Object.keys(matches).length) {
      clearMatches()
      setMatchesData(matches)
    }
  }, [matches])


  return (
    <MatchesTemplate matchesData={matchesData}></MatchesTemplate>
  );
};

export default PartidosView;
