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
      <Navbar fluid className="site-nav">
        <Drawer open={isOpen} onClose={handleClose}>
          <DrawerHeader title="Drawer" />
          <DrawerItems>
            <Sidebar handleClose={handleClose} />
          </DrawerItems>
        </Drawer>
        <div className="flex md:order-2">
          {!user && <Button className="nav-action" onClick={() => signIn()}>Ingresar</Button>}
          {user && <Button className="nav-action" onClick={() => signOut({ callbackUrl: '/' })}>Salir</Button>}
          <NavbarToggle />
        </div>
        <NavbarCollapse>
          <NavbarLink className="nav-menu-link" href="#" active onClick={() => setIsOpen(true)}>
            Menu
          </NavbarLink>
        </NavbarCollapse>
        <NavbarBrand as={Link} href="/" className="site-brand">
          <span className="site-brand-mark">WT</span>
          <span className="site-brand-name">
            <strong>Westfold</strong>
            <small>Tennis club</small>
          </span>
        </NavbarBrand>
      </Navbar>
    </>
  );
};

export default NavBarTemplate;
