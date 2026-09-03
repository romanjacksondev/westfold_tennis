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
      <aside className="site-sidebar">
        <div className="site-sidebar-brand">
          <span className="site-brand-mark">WT</span>
          <span className="site-brand-name">
            <strong>Westfold</strong>
            <small>Tennis club</small>
          </span>
        </div>
        <Sidebar handleClose={() => undefined} />
      </aside>
      <Navbar fluid className="site-nav">
        <Drawer className="site-drawer" open={isOpen} onClose={handleClose}>
          <DrawerHeader title="Westfold Tennis" />
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
