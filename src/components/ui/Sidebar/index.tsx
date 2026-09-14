import { SidebarInterface } from './interfaces/Sidebar.interface';
import SidebarTemplate from './Sidebar.template';

const Sidebar = ({ handleClose }: SidebarInterface) => {
  return <SidebarTemplate handleClose={handleClose} />;
};

export default Sidebar;
