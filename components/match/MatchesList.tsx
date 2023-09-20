import PageTitle from "../PageTitle";
import NewMatchModal from "./NewMatchModal";
import Table from "./MatchesTable";

export default function MatchesList({ matchesList, tournamentId }) {
  const addButton = <NewMatchModal tournamentId={tournamentId} />;

  return (
    <>
      <PageTitle
        title="Los partidos del torneo"
        description=""
        button={addButton}
      />
      <Table records={matchesList}></Table>
    </>
  );
}
