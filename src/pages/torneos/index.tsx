import MainLayout from '../../layouts/Main'
import TournamentsView from 'views/Tournaments'

const Torneos = () => (
  <MainLayout
    component={TournamentsView}
    pageTitle={`Torneos`}
  />
)

export default Torneos
