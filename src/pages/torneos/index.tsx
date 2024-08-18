import MainLayout from '../../layouts/Main'
import Torneo from 'views/Torneos'

const Torneos = () => (
  // <LoginLayout
    // component={SignInView}
    // pageTitle={`${DEFAULT_TITLE} - Ingresar`}
  // />
  <MainLayout
    component={Torneo}
    pageTitle={`Torneos`}
  />
)

export default Torneos
