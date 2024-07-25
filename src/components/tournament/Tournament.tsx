import PageTitle from "../PageTitle";
import NewTournamentModal from "./NewTournamentModal";
import Table from "./TournamentTable";

export default function Tournament({ tournamentsList }) {
  const orderedTour = tournamentsList.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const addButton = <NewTournamentModal />;

  return (
    <>
      <PageTitle title="Los Torneos pa" description="" button={addButton} />
      <Table records={orderedTour}></Table>
    </>
  );
}
