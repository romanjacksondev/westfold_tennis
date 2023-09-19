import PageTitle from "../PageTitle";
import NewPlayerModal from "./NewPlayerModal";
import Table from "./PlayerTable";

export default function Player({ playersList }) {
  const addButton = <NewPlayerModal />;
  return (
    <>
      <PageTitle title="Jugaaaadoooooresss" description="" button={addButton} />
      <Table records={playersList}></Table>
    </>
  );
}
