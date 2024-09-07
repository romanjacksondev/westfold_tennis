//Libs
import React, { useState } from 'react'
import Image from 'next/image'

// Hooks
// import { useSession } from 'hooks/useSession'

// Store
import { useSelectors } from 'store/selectors'

// Components
// import { TextBodyLg } from 'components/Text'
import Sidebar from 'components/Sidebar'
import SantanderLogo from 'components/Logo'

// Assets
import Power from 'assets/images/power.svg'
import User from 'assets/icons/user.svg'

const NavBarTopTemplate = () => {
  // const { logout } = useSession()
  const { config } = useSelectors()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav className="bg-white px-6 md:px-20 py-4 h-[72px] grid grid-cols-3 border-b-2 border-gray-300 z-20 relative">
      <div className="flex items-center justify-start">
      {
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        }
      </div>

      <div className="items-start justify-center pt-1 hidden md:flex">
        { <SantanderLogo /> }
        
      </div>

      {/* <div className="flex items-center justify-end col-span-2 md:col-span-1">
        <div className="flex items-center justify-end">
          {user && (
            <div className="flex flex-col items-end">
              <div className="flex">
                <div className=" flex max-w-[200px] overflow-hidden">
                  <Image src={User.src} height={22} width={22} alt="Usuario" />
                  <TextBodyLg className="ml-1 font-semibold truncate">
                    {user.name} {user.lastName}
                  </TextBodyLg> 
                  
                </div>
              </div>
            </div>
          )}
          <div className="w-10 flex justify-end">
            <button onClick={logout}>
              <Image
                src={Power.src}
                width={22}
                height={22}
                alt="Cerrar Sesión"
              />
            </button>
          </div>
        </div>
      </div> */}
    </nav>
  )
}

export default NavBarTopTemplate
