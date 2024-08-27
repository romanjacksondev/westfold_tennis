import MatchesView from 'views/Matches'
import MainLayout from '../../../layouts/Main'

const Partidos = () => (
  <MainLayout
    component={MatchesView}
    pageTitle={`Partidos`}
  />
)

export default Partidos