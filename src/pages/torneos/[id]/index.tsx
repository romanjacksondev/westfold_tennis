import MatchesView from 'views/Matches'
import MainLayout from '../../../layouts/Main'

interface Props {
  id: string;
}

const Partidos = ({ id }: Props) => (
  <MainLayout
    component={MatchesView}
    pageTitle={`Partidos`}
  />
)

export default Partidos