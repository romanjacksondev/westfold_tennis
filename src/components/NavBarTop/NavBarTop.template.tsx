'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Power from '../../assets/images/power.svg';
// import User from '../../assets/images/user.svg';
import { TextBodyLg } from '../Text';

const NavBarTopTemplate = () => {
  const { data: session } = useSession();
  // const [isOpen, setIsOpen] = useState(config.showSidebar)
  const [user, setUser] = useState(session?.user);

  useEffect(() => {
    if (session) {
      setUser(session.user);
    } else {
      setUser(undefined);
    }
  }, [session]);

  return (
    <nav className="bg-white px-6 md:px-20 py-4 h-[72px] grid grid-cols-3 border-b-2 border-gray-300 z-20 relative">
      <div className="flex items-center justify-start">
        {
          // <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        }
      </div>

      <div className="items-start justify-center pt-1 hidden md:flex">
        {/* {<WestfoldLogo />} */ 'ALLALAA'}
      </div>

      <div className="flex items-center justify-end col-span-2 md:col-span-1">
        <div className="flex items-center justify-end">
          {session && session.user && (
            <div className="flex flex-col items-end">
              <div className="flex">
                <div className=" flex max-w-[200px] overflow-hidden">
                  {/* <Image src={User.src} height={22} width={22} alt="Usuario" /> */}
                  <TextBodyLg className="ml-1 font-semibold truncate">{user?.name}</TextBodyLg>
                  <div className="w-10 flex justify-end">
                    <button onClick={() => signOut()}>
                      <Image src={Power.src} width={22} height={22} alt="Cerrar Sesión" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!session?.user && (
            <div>
              <button onClick={() => signIn()}>Ingresar</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBarTopTemplate;
