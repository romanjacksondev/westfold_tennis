import { useEffect, useState } from "react";
import BasicInput from "../BasicInput";
import CustomDropdown from "../CustomDropdown";
import arrayAsOptions from "../../utils/arrayAsOptions";

const NewTournamentForm = ({ setter }) => {
  const [playerList, setPlayerList] = useState();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [points, setPoints] = useState("");
  const [winner, setWinner] = useState("");

  useEffect(() => {
    fetch("/api/getPlayers")
      .then((res) => res.json())
      .then((data) => {
        setPlayerList(arrayAsOptions(data.response));
      });
  }, []);

  useEffect(() => {
    setter({
      name,
      location,
      points,
      player_id: winner,
    });
  }, [name, location, points, winner]);

  return (
    <>
      <BasicInput
        id={"tournament_name"}
        text="Nombre Torneo"
        setter={setName}
        value={name}
      />
      <BasicInput
        id={"tournament_location"}
        text="Ubicacion"
        setter={setLocation}
        value={location}
      />
      <CustomDropdown
        options={playerList}
        func={setWinner}
        placeholder={"Elegir jugador ganador"}
      />
      <BasicInput
        id={"tournament_points"}
        text="Puntos"
        setter={setPoints}
        value={points}
      />
    </>
  );
};
export default NewTournamentForm;
