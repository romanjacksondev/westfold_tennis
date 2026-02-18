import MatchesView from "views/Matches";
import MainLayout from "../../../app/layout";

const Partidos = () => (
  <MainLayout component={MatchesView} pageTitle={`Partidos`} />
);

export default Partidos;
