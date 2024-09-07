import MainLayout from '../../layouts/Main'
import Jugador from 'views/Jugadores'

const Jugadores = () => (
  <MainLayout
    component={Jugador}
    pageTitle={`Jugadores`}
  />
)

export default Jugadores
