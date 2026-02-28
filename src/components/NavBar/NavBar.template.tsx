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
import { signIn, useSession } from 'next-auth/react';
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
            <Sidebar />
          </DrawerItems>
        </Drawer>
        <div className="flex md:order-2">
          <Button onClick={() => signIn()}>Ingresar</Button>
          <NavbarToggle />
        </div>
        <NavbarCollapse>
          <NavbarLink href="#" active onClick={() => setIsOpen(true)}>
            Menu
          </NavbarLink>
        </NavbarCollapse>
        <NavbarBrand as={Link} href="https://flowbite-react.com">
          <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Flowbite React
          </span>
        </NavbarBrand>
      </Navbar>
    </>
  );
};

export default NavBarTemplate;
