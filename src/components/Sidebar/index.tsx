import SidebarTemplate from './Sidebar.template'
import { SidebarProps } from './Sidebar.types'

const Sidebar = ({ ...props }: SidebarProps) => {
  return <SidebarTemplate {...props} />
}

export default Sidebar
