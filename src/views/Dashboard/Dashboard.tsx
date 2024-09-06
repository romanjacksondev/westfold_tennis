import AddPlayer from "./components/jugadores/AddPlayer";
import AddMatch from "./components/matches/AddMatch";
import AddTournament from "./components/tournament/AddTournament";
import AddVenue from "./components/venue/AddVenue";

const DashboardView = () => {

  return (

    <>
      <AddTournament></AddTournament>

      <AddVenue></AddVenue>

      <AddMatch></AddMatch>

      <AddPlayer></AddPlayer>
    </>

  )
};

export default DashboardView;
