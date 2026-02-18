import DashboardView from "views/Dashboard";
import MainLayout from "../../app/layout";

const Dashboard = () => (
  <MainLayout component={DashboardView} pageTitle={`Dashboard`} />
);

export default Dashboard;
