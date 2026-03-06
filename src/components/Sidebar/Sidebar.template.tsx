import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

// Assets
import Draw from '../../../public/icons/tennis-bracket.svg';
import Venue from '../../../public/icons/tennis-court.svg';
import Dashboard from '../../../public/icons/tennis-dashboard.svg';
import Information from '../../../public/icons/tennis-information.svg';
import Ranking from '../../../public/icons/tennis-leaderboard.svg';
import Player from '../../../public/icons/tennis-player.svg';
import Stats from '../../../public/icons/tennis-stats.svg';
import Tournament from '../../../public/icons/tennis-table.svg';
import { SidebarInterface } from './interfaces/Sidebar.interface';

const SidebarTemplate = ({ handleClose }: SidebarInterface) => {
  const items = [
    {
      label: 'Ranking',
      icon: Ranking,
      path: '/leaderboard',
    },
    {
      label: 'Torneos',
      icon: Tournament,
      path: '/tournaments',
    },
    {
      label: 'Jugadores',
      icon: Player,
      path: '/players',
    },
    {
      label: 'Sedes',
      icon: Venue,
      path: '/venues',
    },
    {
      label: 'Estadisticas',
      icon: Stats,
      path: '/stats',
    },
    {
      label: 'Draw Generator',
      icon: Draw,
      path: '/draws',
    },
    {
      label: 'Informacion General',
      icon: Information,
      path: '/information',
    },
    {
      label: 'Excusas generator 2000',
      icon: Information,
      path: '/excusator',
    },
  ];

  const { data: session } = useSession();
  if (session) {
    items.push({
      label: 'Dashboard',
      icon: Dashboard,
      path: '/dashboard',
    });
  }

  return (
    <>
      {/* <button onClick={toggleMenu} className="flex">
        <Image src={Hamburguer} height={24} width={24} alt="Menu" />
        Menu
      </button>

      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 z-30 bg-gray-500 bg-opacity-20 transition-opacity backdrop-blur-[2px]"
        />
      )} */}

      {/* <div className={isOpen ? 'left-0' : 'left-[-320px]'}> */}
      <div>
        {/* Menu Options */}
        {/* <button onClick={toggleMenu} className="mb-10 flex items-center text-sm gap-2 p-1">
          <Image src={Close} height={24} width={24} alt="Close" />
          Cerrar
        </button> */}

        <ul>
          {items.map((item, index) => (
            <li className="flex items-center p-1 gap-2 mt-3 font-bold" key={`list-${index}`}>
              <Link
                href={item.path}
                className="flex items-center gap-2 w-full"
                onClick={handleClose}
              >
                <Image src={item.icon} height={24} width={24} alt={item.label} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* <button
          className="absolute bottom-6 flex items-center gap-2 p-1 font-bold"
          onClick={logout}
        >
          <Image src={Power} height={24} width={24} alt="" />
          <TextBody>Salir</TextBody>
        </button> */}
      </div>
    </>
  );
};

export default SidebarTemplate;
