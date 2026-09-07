import NextAuthSessionProvider from '@/utils/SessionProvider';
import SiteFooter from '@/components/features/SiteFooter';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/ui/NavBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Westfold Tennis',
  description: 'Friendly tennis stat tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
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
