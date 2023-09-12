import Link from "next/link";
import AddEntityModal from "./modal";
import NewPlayer from "./newPlayer";

export default function Player({ playersList }) {
  return (
    <div className="container mx-auto">
      <section className="bg-white py-[70px]">
        <div className="mx-auto px-4 sm:container">
          <div className="border-stroke border-b">
            <h2 className="mb-2 text-2xl font-semibold text-black">
              Jugaaaadoooooresss
            </h2>
          </div>
        </div>
        <div className="w-full">
          <ul>
            {playersList.map((player) => (
              <li
                key={player.id}
                className="text-body-color mb-4 flex text-base"
              >
                <span className="bg-primary mr-2 mt-2 flex h-2 w-full max-w-[8px] items-center justify-center rounded-full text-base"></span>
                <Link href={`/matches/${player.id}`}>{player.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <AddEntityModal>
          <NewPlayer />
        </AddEntityModal>
        {/* <h2>
          <Link href="/">Volver al inicio</Link>
        </h2> */}
      </section>
    </div>
  );
}
