import { useState } from "react";

const NewPlayer = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNewPlayer = async () => {
    setIsLoading(true);
    const res = await fetch("/api/new_player", {
      method: "POST",
      body: JSON.stringify({
        name
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
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </div>

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
export default NewPlayer;
