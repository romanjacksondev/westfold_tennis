import JugadoresView from "views/Jugadores";
import MainLayout from "../../app/layout";

const Jugadores = () => (
  <MainLayout component={JugadoresView} pageTitle={`Partidos`} />
);

export default Jugadores;
