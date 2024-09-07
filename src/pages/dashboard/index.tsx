import MainLayout from '../../layouts/Main'
import DashboardView from 'views/Dashboard'

const Dashboard = () => (
  <MainLayout
    component={DashboardView}
    pageTitle={`Dashboard`}
  />
)

export default Dashboard
