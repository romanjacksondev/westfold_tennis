import '@/app/globals.css';
import NextAuthSessionProvider from '@/utils/SessionProvider';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextAuthSessionProvider>
      <Component {...pageProps} />
    </NextAuthSessionProvider>
  );
}