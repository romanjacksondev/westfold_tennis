'use client';
import { NavBar } from '@/components/NavBar';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 dark:bg-zinc-800">
        <SessionProvider>
          <div className="h-full z-10">
            <Head>
              <title>{'title'}</title>
            </Head>
            <NavBar />
            <section className="p-6 sm:px-20 relative sm:pt-6 sm:pb-16 z-10 flex-grow flex flex-col min-h-[calc(100%-72px)]">
              {/* <Component title={title} /> */}
              {children}
            </section>
            {/* {background && (
            <div
              style={{
                backgroundImage: `url(${background})`,
                backgroundPosition,
              }}
              className="z-0 absolute bottom-0 bg-no-repeat w-full h-screen bg-contain"
            />
          )} */}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
