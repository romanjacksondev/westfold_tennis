import { useEffect, useState } from "react";
import BasicInput from "../BasicInput";
import CustomDropdown from "../CustomDropdown";
import arrayAsOptions from "../../utils/arrayAsOptions";

const NewTournamentForm = ({ setter }) => {
  const [playerList, setPlayerList] = useState();
  const [venuesList, setVenuesList] = useState();
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  const [winner, setWinner] = useState("");

  useEffect(() => {
    fetch("/api/getPlayers")
      .then((res) => res.json())
      .then((data) => {
        setPlayerList(arrayAsOptions(data.response));
      });
      fetch("/api/getVenues")
      .then((res) => res.json())
      .then((data) => {
        setVenuesList(arrayAsOptions(data.response));
      });      
  }, []);

  useEffect(() => {
    setter({
      name,
      venue,
      player_id: winner,
    });
  }, [name, venue, winner]);

  return (
    <>
      <BasicInput
        id={"tournament_name"}
        text="Nombre Torneo"
        setter={setName}
        value={name}
      />
      <CustomDropdown
        options={venuesList}
        func={setVenue}
        placeholder={"Elegir sede del torneo"}
      />      
      <CustomDropdown
        options={playerList}
        func={setWinner}
        placeholder={"Elegir jugador ganador"}
      />
    </>
  );
};
export default NewTournamentForm;
