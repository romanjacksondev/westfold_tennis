import PageTitle from "../PageTitle";
import NewVenueModal from "./NewVenueModal";
import Table from "./VenueTable";

export default function Venue({ venuesList }) {
  const addButton = <NewVenueModal />;
  return (
    <>
      <PageTitle title="Sedes de los torneos" description="" button={addButton} />
      <Table records={venuesList}></Table>
    </>
  );
}
