import PropTypes from "prop-types";
import LoadingComponent from "components/Loader";
import SummaryTemplate from "./components/Summary.template";

const PartidosTemplate = ({ matchesData }) => {

  // if (Object.keys(matchesList).length == 0 || !matchesList[0].tournament) {
  if (!matchesData || Object.keys(matchesData).length == 0) {
    return <LoadingComponent size="large" />;
  }

  console.log("summary1232: ", matchesData)

  return <>
    <SummaryTemplate summary={matchesData.matchSummary} />
  </>
};

PartidosTemplate.propTypes = {
  matchesData: PropTypes.arrayOf(
    PropTypes.shape({
      matchSummary: PropTypes.shape({
        player1Id: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
};

export default PartidosTemplate;
