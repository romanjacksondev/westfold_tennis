import PageTitle from "../PageTitle";
import NewMatchModal from "./NewMatchModal";
import Table from "./MatchesTable";

export default function Match({ matchesList, tournamentId, tournamentName }) {
  const addButton = <NewMatchModal tournamentId={tournamentId} />;

  return (
    <>
      <PageTitle
        title={`Partidos del torneo ${tournamentName}`}
        description=""
        button={addButton}
      />
      <Table records={matchesList}></Table>
    </>
  );
}
