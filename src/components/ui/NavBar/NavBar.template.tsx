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
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';

const NavBarTemplate = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isDashboardView = pathname === '/dashboard';
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
      {!isDashboardView && (
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
      )}
      <Navbar fluid className="site-nav">
        {!isDashboardView && (
          <Drawer className="site-drawer" open={isOpen} onClose={handleClose}>
            <DrawerHeader title="Westfold Tennis" />
            <DrawerItems>
              <Sidebar handleClose={handleClose} />
            </DrawerItems>
          </Drawer>
        )}
        <div className="flex md:order-2 items-center gap-2">
          {!user && <Button className="nav-action" onClick={() => signIn()}>Ingresar</Button>}
          {user && (
            <div className="flex items-center gap-2">
              {user.playerId ? (
                <Link
                  href={`/players/${user.playerId}`}
                  className="text-xs font-semibold px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 transition"
                  title="Ver mi perfil deportivo"
                >
                  👤 {user.name || user.email}
                </Link>
              ) : (
                <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                  {user.name || user.email}
                </span>
              )}
              <Button className="nav-action" onClick={() => signOut({ callbackUrl: '/' })}>Salir</Button>
            </div>
          )}
          {!isDashboardView && <NavbarToggle className="nav-toggle" />}
        </div>
        {!isDashboardView && (
          <NavbarCollapse>
            <NavbarLink className="nav-menu-link" href="#" active onClick={() => setIsOpen(true)}>
              Menu
            </NavbarLink>
          </NavbarCollapse>
        )}
        <NavbarBrand as={Link} href="/" className="site-brand">
          <span className="site-brand-mark">WT</span>
          <span className="site-brand-name">
            <strong>Westfold</strong>
            <small>{isDashboardView ? 'Admin console' : 'Tennis club'}</small>
          </span>
        </NavbarBrand>
      </Navbar>
    </>
  );
};

export default NavBarTemplate;
