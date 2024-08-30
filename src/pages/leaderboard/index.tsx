import MainLayout from '../../layouts/Main'
import Leaderboard from 'views/Leaderboard'

const LeaderBoard = () => (
  <MainLayout
    component={Leaderboard}
    pageTitle={`Ranking`}
  />
)
export default LeaderBoard