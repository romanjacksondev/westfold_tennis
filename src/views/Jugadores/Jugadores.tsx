import { useSelectors } from "store/selectors";
import JugadoresTemplate from "./Jugadores.template";

const JugadoresView = () => {

  const { players } = useSelectors()

return (
  <JugadoresTemplate players={players}></JugadoresTemplate>
)


};

export default JugadoresView;
