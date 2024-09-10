import InfoPlayerView from 'views/InfoPlayer'
import MainLayout from '../../../layouts/Main'

const Jugadores = () => (
  <MainLayout
    component={InfoPlayerView}
    pageTitle={`Partidos`}
  />
)

export default Jugadores