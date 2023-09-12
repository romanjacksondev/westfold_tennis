import Link from "next/link";
import AddEntityModal from "./modal";
import NewTournament from "./newTournament";

export default function Tournament({ tournamentsList }) {
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
            {tournamentsList
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((tournament) => (
                <li
                  key={tournament.id}
                  className="text-body-color mb-4 flex text-base"
                >
                  <span className="bg-primary mr-2 mt-2 flex h-2 w-full max-w-[8px] items-center justify-center rounded-full text-base"></span>
                  <Link href={`/tournaments/${tournament.id}`}>
                    {tournament.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <AddEntityModal>
          <NewTournament />
        </AddEntityModal>
      </section>
    </div>
  );
}
