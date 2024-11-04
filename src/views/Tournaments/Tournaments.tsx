/** @format */

import { useSelectors } from "store/selectors";
import TournamentsTemplate from "./Tournaments.template";

const TournamentsView = () => {
  const { tournaments } = useSelectors();

  return <TournamentsTemplate tournaments={tournaments} />;
};

export default TournamentsView;
