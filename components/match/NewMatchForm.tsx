import { useEffect, useState } from "react";
import CustomDropdown from "../CustomDropdown";
import arrayAsOptions from "../../utils/arrayAsOptions";
import BasicInput from "../BasicInput";

const NewMatchForm = ({ setter }) => {
  const [playerList, setPlayerList] = useState();
  const [winner, setWinner] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
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
    if (pointsPlayer1 > pointsPlayer2) {
      setWinner(player1);
    } else {
      setWinner(player2);
    }
    // debugger;
    setter({
      idPlayer1: player1,
      idPlayer2: player2,
      winnerId: winner,
      pointsPlayer1: pointsPlayer1,
      pointsPlayer2: pointsPlayer2,
    });
  }, [winner, player1, player2, pointsPlayer1, pointsPlayer2]);

  return (
    <>
      <CustomDropdown
        options={playerList}
        func={setPlayer1}
        placeholder={"Elegir jugador 1"}
      />
      <CustomDropdown
        options={playerList}
        func={setPlayer2}
        placeholder={"Elegir jugador 2"}
      />
      <h3 className="pb-2 text-xl font-bold text-dark sm:text-2xl">
        Datos del set
      </h3>
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
export default NewMatchForm;
