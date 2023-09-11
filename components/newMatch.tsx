
import { useState } from "react";

const NewMatch = (id) => {
  const [winner, setWinner] = useState("");
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


//   id               String             @id @default(cuid())
//   winner           String
//   tournamentId     String?
//   tournament       Tournament?        @relation(fields: [tournamentId], references: [id])
//   players          Player[]
//   PlayersOnMatches PlayersOnMatches[]

  const handleNewPlayer = async () => {
    setIsLoading(true);
    const res = await fetch("/api/new_match", {
      method: "POST",
      body: JSON.stringify({
        winner: winner,
        tournamentId: id
      }),
    });
    const data = await res.json();
    setIsLoading(false);
  };

  return (
    <div className="p-3 mt-9 flex flex-col space-y-4 justify-center border-2 border-red-400 ">
      <div className="p-2">
        <input
          type="text"
          className="w-full p-2 rounded-lg text-black/90"
          placeholder="Nombre"
          onChange={(e) => setWinner(e.target.value)}
          value={winner}
        />
      </div>
      <select > 
      <option value="Select a fruit"> -- Select a fruit -- </option>
    </select>


      <div className="flex justify-center">
        <button
          disabled={isLoading}
          className="bg-blue-400 w-fit px-7 py-2 rounded-lg disabled:bg-gray-700"
          onClick={() => handleNewPlayer()}
        >
          {isLoading ? "Creando.." : "Crear"}
        </button>
      </div>
    </div>
  );
};
export default NewMatch;
