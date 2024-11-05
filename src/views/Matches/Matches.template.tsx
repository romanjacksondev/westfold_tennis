import PropTypes from "prop-types";
import LoadingComponent from "components/Loader";
import SummaryTemplate from "./components/Summary.template";
import { TextHeadingH4 } from "components/Text";
import MatchesListTemplate from "./components/MatchesList.template";

const PartidosTemplate = ({ matchesData }) => {

  if (!matchesData || Object.keys(matchesData).length == 0) {
    return <LoadingComponent size="large" />;
  }

  // console.log("summary1232: ", matchesData)

  return (
    <>
      <TextHeadingH4>
        {matchesData.tournamentData.champion} campeon de{" "}
        {matchesData.tournamentData.name}
      </TextHeadingH4>
      <SummaryTemplate playerStats={matchesData.playerStats} />
      <MatchesListTemplate summary={matchesData.matchSummary} />
    </>
  )
};

PartidosTemplate.propTypes = {
  matchesData: PropTypes.shape({
    tournamentData: PropTypes.shape({
      champion: PropTypes.string,
      name: PropTypes.string
    }),
    matchSummary: PropTypes.shape({
      player1Name: PropTypes.shape({
        name: PropTypes.string
      }),
      player2Name: PropTypes.shape({
        name: PropTypes.string
      }),
      player1Id: PropTypes.string,
      player2Id: PropTypes.string,
      sets: PropTypes.array.isRequired

    }),
    playerStats: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.number,
      matchesWon: PropTypes.number,
      matchesLost: PropTypes.number,
      gamesWon: PropTypes.number,
      gamesLost: PropTypes.number
    })

  }).isRequired,
};

export default PartidosTemplate;
