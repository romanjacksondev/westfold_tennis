import { useState } from "react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import CustomDropdown from "./CustomDropdown";

const NewMatch = ({ id, playersList }) => {
  const [winner, setWinner] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const playersAsOptions = playersList?.map((player) => {
    return { value: player.id, label: player.name };
  });

  const handleNewMatch = async () => {
    setIsLoading(true);
    const res = await fetch("/api/new_match", {
      method: "POST",
      body: JSON.stringify({
        winner: winner,
        tournamentId: id,
        player1: player1,
        player2: player2,
      }),
    });
    const data = await res.json();
    setIsLoading(false);
  };

  const handlePlayer1 = (option) => {
    setPlayer1(option.value);
  };

  const handlePlayer2 = (option) => {
    setPlayer2(option.value);
  };

  return (
    <div className="w-full max-w-xs">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Ganador del partido
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="winner"
          type="text"
          placeholder="Ganador del partido"
          onChange={(e) => setWinner(e.target.value)}
          value={winner}
        />
      </div>

      <p>Jugador 1</p>
      <Dropdown
        options={playersAsOptions}
        onChange={(option) => handlePlayer1(option)}
        placeholder="Elegir jugador"
      />
      <p>Jugador 2</p>
      <CustomDropdown
        options={playersAsOptions}
        func={handlePlayer1}
        placeholder="Elegir jugador"
      />

      {/* <Dropdown
        options={playersAsOptions}
        onChange={(option) => handlePlayer2(option)}
        placeholder="Elegir jugador"
      /> */}
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
