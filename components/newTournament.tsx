import { useState } from "react";

const NewTournament = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [points, setPoints] = useState("");
  const [winner, setWinner] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNewTournament = async () => {
    setIsLoading(true);
    const res = await fetch("/api/new_tournament", {
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
    <>
      <label className="mb-3 block text-base font-medium text-black">
        Nombre Torneo
      </label>
      <input
        type="text"
        placeholder="Nombre Torneo"
        className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary w-full rounded-lg border-[1.5px] py-3 px-5 font-medium outline-none transition disabled:cursor-default disabled:bg-[#F5F7FD]"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />

      <label className="mb-3 block text-base font-medium text-black">
        Ubicacion
      </label>
      <input
        type="text"
        placeholder="Ubicacion"
        className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary w-full rounded-lg border-[1.5px] py-3 px-5 font-medium outline-none transition disabled:cursor-default disabled:bg-[#F5F7FD]"
        onChange={(e) => setLocation(e.target.value)}
        value={location}
      />

      <label className="mb-3 block text-base font-medium text-black">
        Ganador
      </label>
      <input
        type="text"
        placeholder="Ganador"
        className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary w-full rounded-lg border-[1.5px] py-3 px-5 font-medium outline-none transition disabled:cursor-default disabled:bg-[#F5F7FD]"
        onChange={(e) => setWinner(e.target.value)}
        value={winner}
      />

      <label className="mb-3 block text-base font-medium text-black">
        Puntos
      </label>
      <input
        type="text"
        placeholder="Puntos"
        className="border-form-stroke text-body-color placeholder-body-color focus:border-primary active:border-primary w-full rounded-lg border-[1.5px] py-3 px-5 font-medium outline-none transition disabled:cursor-default disabled:bg-[#F5F7FD]"
        onChange={(e) => setPoints(e.target.value)}
        value={points}
      />
      <div className="flex justify-center">
        <button
          disabled={isLoading}
          className="bg-blue-400 w-fit px-7 py-2 rounded-lg disabled:bg-gray-700"
          onClick={() => handleNewTournament()}
        >
          {isLoading ? "Creando.." : "Crear"}
        </button>
      </div>
    </>
  );
};
export default NewTournament;
