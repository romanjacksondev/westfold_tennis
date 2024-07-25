import { useEffect, useState } from "react";
import CustomDropdown from "../CustomDropdown";
import arrayAsOptions from "../../utils/arrayAsOptions";
import BasicInput from "../BasicInput";

const NewSetForm = ({ setter }) => {
  const [playerList, setPlayerList] = useState();
  const [winner, setWinner] = useState("");
  const [pointsPlayer1, setPointsPlayer1] = useState("");
  const [pointsPlayer2, setPointsPlayer2] = useState("");

  useEffect(() => {
    fetch("/api/getPlayers")
      .then((res) => res.json())
      .then((data) => {
        setPlayerList(arrayAsOptions(data.response));
      });
  }, []);

  useEffect(() => {
    setter({
      pointsPlayer1: pointsPlayer1,
      pointsPlayer2: pointsPlayer2,
      winnerId: winner,
    });
  }, [winner, pointsPlayer1, pointsPlayer2]);

  return (
    <>
      <CustomDropdown
        options={playerList}
        func={setWinner}
        placeholder={"Ganador"}
      />
      <BasicInput
        id={"resultado"}
        text="Games Jugador 1"
        setter={setPointsPlayer1}
        value={pointsPlayer1}
      />
      <BasicInput
        id={"resultado"}
        text="Games Jugador 2"
        setter={setPointsPlayer2}
        value={pointsPlayer2}
      />
    </>
  );
};
export default NewSetForm;
