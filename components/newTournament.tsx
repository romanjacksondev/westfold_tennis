import { useState } from "react";

const NewTournament = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [points, setPoints] = useState("");
  const [winner, setWinner] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNewTournament = async () => {
    setIsLoading(true);
    const res = await fetch("/api/new", {
      method: "POST",
      body: JSON.stringify({
        name,
        location,
        winner,
        points,
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
          placeholder="Nombre del torneo"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </div>

      <div className="p-2">
        <input
          type="text"
          className="w-full p-2 rounded-lg text-black/90"
          placeholder="Ubicacion"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
        />
      </div>

      <div className="p-2">
        <input
          type="text"
          className="w-full p-2 rounded-lg text-black/90"
          placeholder="Ganador"
          onChange={(e) => setWinner(e.target.value)}
          value={winner}
        />
      </div>

      <div className="p-2">
        <input
          type="text"
          className="w-full p-2 rounded-lg text-black/90"
          placeholder="Puntos"
          onChange={(e) => setPoints(e.target.value)}
          value={points}
        />
      </div>

      <div className="flex justify-center">
        <button
          disabled={isLoading}
          className="bg-blue-400 w-fit px-7 py-2 rounded-lg disabled:bg-gray-700"
          onClick={() => handleNewTournament()}
        >
          {isLoading ? "Creando.." : "Crear"}
        </button>
      </div>
    </div>
  );
};
export default NewTournament;
