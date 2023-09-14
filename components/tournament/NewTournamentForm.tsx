import { useEffect, useState } from "react";
import BasicInput from "../BasicInput";

const NewTournamentForm = ({ setter }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [points, setPoints] = useState("");
  const [winner, setWinner] = useState("");

  useEffect(() => {
    setter({
        name,
        location,
        winner,
        points,
      })
  }, [name, location, points, winner]);

  return (
    <>
      <BasicInput text="Nombre Torneo" setter={setName} value={name} />
      <BasicInput text="Ubicacion" setter={setLocation} value={location} />
      <BasicInput text="Ganador" setter={setWinner} value={winner} />
      <BasicInput text="Puntos" setter={setPoints} value={points} />
    </>
  );
};
export default NewTournamentForm;
