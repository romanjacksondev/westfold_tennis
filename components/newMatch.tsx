import { useState } from "react";
import Dropdown from "react-dropdown";
import 'react-dropdown/style.css';

const NewMatch = ({ id, playersList }) => {
  const [winner, setWinner] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const playersAsOptions = playersList?.map((player) => {
    return { value: player.id, label: player.name };
  });

  //   id               String             @id @default(cuid())
  //   winner           String
  //   tournamentId     String?
  //   tournament       Tournament?        @relation(fields: [tournamentId], references: [id])
  //   players          Player[]
  //   PlayersOnMatches PlayersOnMatches[]
  const handleNewMatch = async () => {
    setIsLoading(true);
    const res = await fetch("/api/new_match", {
      method: "POST",
      body: JSON.stringify({
        winner: winner,
        tournamentId: id,
        player1: player1,
        player2: player2
      }),
    });
    const data = await res.json();
    setIsLoading(false);
  };

const handlePlayer1 = (option) => {
    setPlayer1(option.value)
}

const handlePlayer2 = (option) => {
    setPlayer2(option.value)
}

  return (
    <div className="p-3 mt-9 flex flex-col space-y-4 justify-center border-2 border-red-400 ">
      <div className="p-2">
        <p>Ganador del partido</p>
        <input
          type="text"
          className="w-full p-2 rounded-lg text-black/90"
          placeholder="Nombre"
          onChange={(e) => setWinner(e.target.value)}
          value={winner}
        />
      </div>
      <p>Jugador 1</p>
      <Dropdown options={playersAsOptions} onChange={option => handlePlayer1(option)} placeholder="Elegir jugador" />
      <p>Jugador 2</p>
      <Dropdown options={playersAsOptions} onChange={option => handlePlayer2(option)} placeholder="Elegir jugador" />
      <div className="flex justify-center">
        <button
          disabled={isLoading}
          className="bg-blue-400 w-fit px-7 py-2 rounded-lg disabled:bg-gray-700"
          onClick={() => handleNewMatch()}
        >
          {isLoading ? "Creando.." : "Crear"}
        </button>
      </div>
    </div>
  );
};
export default NewMatch;
