import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';
import {
  LuChartBar,
  LuGitFork,
  LuInfo,
  LuLayoutDashboard,
  LuMapPin,
  LuMedal,
  LuTrophy,
  LuUsers,
} from 'react-icons/lu';
import { SidebarInterface } from './interfaces/Sidebar.interface';

interface SidebarItem {
  label: string;
  icon: IconType;
  path: string;
}

const SidebarTemplate = ({ handleClose }: SidebarInterface) => {
  const pathname = usePathname();
  const publicItems: SidebarItem[] = [
    {
      label: 'Ranking',
      icon: LuMedal,
      path: '/leaderboard',
    },
  ];
  const privateItems: SidebarItem[] = [
    {
      label: 'Torneos',
      icon: LuTrophy,
      path: '/tournaments',
    },
    {
      label: 'Jugadores',
      icon: LuUsers,
      path: '/players',
    },
    {
      label: 'Sedes',
      icon: LuMapPin,
      path: '/venues',
    },
    {
      label: 'Estadisticas',
      icon: LuChartBar,
      path: '/stats',
    },
    {
      label: 'Draw Generator',
      icon: LuGitFork,
      path: '/draws',
    },
    {
      label: 'Informacion General',
      icon: LuInfo,
      path: '/information',
    },
  ];

  const { data: session, status } = useSession();
  const items: SidebarItem[] =
    status === 'loading'
      ? []
      : session
        ? [...publicItems, ...privateItems]
        : [...publicItems];

  if ((session?.user as { role?: string } | undefined)?.role === 'ADMIN') {
    items.push({
      label: 'Dashboard',
      icon: LuLayoutDashboard,
      path: '/dashboard',
    });
  }

  return (
    <>
      <div>
        <ul>
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              (item.path !== '/' && pathname.startsWith(`${item.path}/`));
            return (
              <li className="flex items-center p-1 gap-2 mt-3 font-bold" key={`list-${index}`}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-2 w-full ${isActive ? 'active' : ''}`}
                  onClick={handleClose}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-[22px] h-[22px] shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default SidebarTemplate;
