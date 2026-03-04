import { NavBar } from '@/components/NavBar';
import NextAuthSessionProvider from '@/utils/SessionProvider';
import type { Metadata } from 'next';
import './globals.css';

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
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
