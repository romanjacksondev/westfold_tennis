'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// The admin console has its own sidebar, so it drops the margin reserved for the site sidebar.
// Driven by the pathname (same source as the NavBar) instead of CSS :has(), which could go stale on client navigations.
export default function SiteContent({ children }: { children: ReactNode }) {
  const isAdmin = usePathname() === '/dashboard';
  return <div className={`site-content${isAdmin ? ' is-admin' : ''}`}>{children}</div>;
}
