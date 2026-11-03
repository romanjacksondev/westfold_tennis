'use client';

import { usePathname } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

function Content({ children }: { children: ReactNode }) {
  const isAdmin = usePathname() === '/dashboard';
  return <div className={`site-content${isAdmin ? ' is-admin' : ''}`}>{children}</div>;
}

// The admin console has its own sidebar, so it drops the margin reserved for the site sidebar.
// Driven by the pathname (same source as the NavBar) instead of CSS :has(), which could go stale on client navigations.
// usePathname() needs a Suspense boundary; the fallback is the regular (non-admin) layout so the page still prerenders.
export default function SiteContent({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="site-content">{children}</div>}>
      <Content>{children}</Content>
    </Suspense>
  );
}
