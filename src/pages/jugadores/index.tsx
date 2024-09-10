import JugadoresView from 'views/Jugadores'
import MainLayout from '../../layouts/Main'

const Jugadores = () => (
  <MainLayout
    component={JugadoresView}
    pageTitle={`Partidos`}
  />
)

export default Jugadores
