import { useSelectors } from "store/selectors";
import JugadoresTemplate, { TennisPlayerProps } from "./Jugadores.template";

const JugadoresView = () => {
  const { players } = useSelectors();

  return <JugadoresTemplate players={players as TennisPlayerProps[]} />;
};

export default JugadoresView;
