import { useEffect, useState } from "react";
import CustomDropdown from "../CustomDropdown";
import arrayAsOptions from "../../utils/arrayAsOptions";
import BasicInput from "../BasicInput";

const NewSetForm = ({ setter }) => {
  const [playerList, setPlayerList] = useState();
  const [winner, setWinner] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  useEffect(() => {
    fetch("/api/getPlayers")
      .then((res) => res.json())
      .then((data) => {
        setPlayerList(arrayAsOptions(data.response));
      });
  }, []);

  useEffect(() => {
    setter({
      idPlayer1: player1,
      idPlayer2: player2,
      winnerId: winner,
    });
  }, [ winner]);

  return (
    <>
      <CustomDropdown
        options={playerList}
        func={setPlayer1}
        placeholder={"Ganador"}
      />
      <CustomDropdown
        options={playerList}
        func={setPlayer2}
        placeholder={"Elegir jugador 2"}
      />
      <CustomDropdown
        options={playerList}
        func={setWinner}
        placeholder={"Elegir ganador"}
      />
      {/* <BasicInput
        id={"resultado"}
        text="Games"
        setter={setPoints}
        value={points}
      /> */}
    </>
  );
};
export default NewSetForm;
