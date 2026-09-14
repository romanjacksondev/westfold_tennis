import { Suspense } from 'react';
import NavBarTemplate from './NavBar.template';

function NavBarFallback() {
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
      </aside>
      <div className="site-nav flex items-center justify-between p-4">
        <span className="site-brand flex items-center gap-2">
          <span className="site-brand-mark">WT</span>
          <span className="site-brand-name">
            <strong>Westfold</strong>
            <small>Tennis club</small>
          </span>
        </span>
      </div>
    </>
  );
}

export const NavBar = () => {
  return (
    <Suspense fallback={<NavBarFallback />}>
      <NavBarTemplate />
    </Suspense>
  );
};
