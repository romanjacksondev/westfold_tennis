import Link from "next/link";
import AddEntityModal from "./modal";
import NewTournament from "./newTournament";
import Table from "./table";

export default function Tournament({ tournamentsList }) {
  const orderedTour = tournamentsList.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="container mx-auto">
      <section className="bg-white py-[70px]">
        <div className="mx-auto px-4 sm:container">
          <div className="border-stroke border-b">
            <h2 className="mb-2 text-2xl font-semibold text-black">
              Los Torneos pa
            </h2>
          </div>
        </div>
        <div className="w-full">
          <ul>
            <Table records={orderedTour}></Table>
          </ul>
        </div>
        <AddEntityModal>
          <NewTournament />
        </AddEntityModal>
      </section>
    </div>
  );
}
