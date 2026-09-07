import NextAuthSessionProvider from '@/utils/SessionProvider';
import SiteFooter from '@/components/features/SiteFooter';
import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/components/ui/NavBar';

export const metadata: Metadata = {
  title: 'Westfold Tennis',
  description: 'Friendly tennis stat tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>
          <NavBar />
          <div className="site-content">
            {children}
            <SiteFooter />
          </div>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
