// Libraries
import React from 'react'
import { useRouter } from 'next/router'
// import { useSession } from 'hooks/useSession'
import Image from 'next/image'
import clsx from 'clsx'

//Components
import { TextBody } from 'components/Text'

// Types
import { SidebarProps } from './Sidebar.types'

// Assets
import Close from 'assets/icons/close.svg'
import Player from 'assets/icons/tennis-player.svg'
import Hamburguer from 'assets/images/hamburguer.svg'
import Tournament from 'assets/icons/tournament-bracket.svg'
import Venue from 'assets/icons/tennis-court.svg'

const SidebarTemplate = ({ isOpen, setIsOpen }: SidebarProps) => {
  const router = useRouter()
  // const { logout } = useSession()
  const items = [
    {
      label: 'Jugadores',
      icon: Player,
      path: "/jugadores",
    },
    {
      label: 'Torneos',
      icon: Tournament,
      path: "/torneos",
    },
    {
      label: 'Sedes',
      icon: Venue,
      path: "/sedes",
    }
  ]

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button onClick={toggleMenu} className="flex">
        <Image src={Hamburguer} height={24} width={24} alt="Menu" />
        <TextBody className="hidden xl:block ml-2 font-bold">Menu</TextBody>
      </button>

      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 z-30 bg-gray-500 bg-opacity-20 transition-opacity backdrop-blur-[2px]"
        />
      )}

      <div
        className={clsx(
          'fixed z-40 top-0 left-0 w-80 h-screen bg-white text-black py-5 px-8 transition-all duration-300 ease-in-out',
          isOpen ? 'left-0' : 'left-[-320px]'
        )}
      >
        {/* Menu Options */}
        <button
          onClick={toggleMenu}
          className="mb-10 flex items-center text-sm gap-2 p-1"
        >
          <Image src={Close} height={24} width={24} alt="Close" />
          <TextBody>Cerrar</TextBody>
        </button>

        <ul>
          {items.map((item, index) => (
            <li
              className="flex items-center p-1 gap-2 mt-3 font-bold cursor-pointer"
              key={`list-${index}`}
              onClick={() => router.push(item.path)}
            >
              <Image src={item.icon} height={24} width={24} alt={item.label} />
              <TextBody>{item.label}</TextBody>
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
  )
}

export default SidebarTemplate
