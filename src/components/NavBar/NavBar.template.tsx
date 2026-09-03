'use client';
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';

const NavBarTemplate = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState(session?.user);
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (session) {
      setUser(session.user);
    } else {
      setUser(undefined);
    }
  }, [session]);

  return (
    <>
      <Navbar fluid rounded>
        <Drawer open={isOpen} onClose={handleClose}>
          <DrawerHeader title="Drawer" />
          <DrawerItems>
            <Sidebar handleClose={handleClose} />
          </DrawerItems>
        </Drawer>
        <div className="flex md:order-2">
          {!user && <Button onClick={() => signIn()}>Ingresar</Button>}
          {user && <Button onClick={() => signOut({ callbackUrl: '/' })}>Salir</Button>}
          <NavbarToggle />
        </div>
        <NavbarCollapse>
          <NavbarLink href="#" active onClick={() => setIsOpen(true)}>
            Menu
          </NavbarLink>
        </NavbarCollapse>
        <NavbarBrand as={Link} href="/">
          <img src="/img/logo/logo_3.jpg" className="mr-3 h-6 sm:h-9" alt="Tennis is fun!" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Westfold Tennis
          </span>
        </NavbarBrand>
      </Navbar>
    </>
  );
};

export default NavBarTemplate;
