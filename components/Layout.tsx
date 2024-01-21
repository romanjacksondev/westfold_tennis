import { useState } from "react";
import Navbar from "./navbar";
import localFont from "next/font/local";
const ringbearer = localFont({
  src: "../assets/font/ringbearer/ringbearer.woff",
});

export default function Layout({ children }) {
  const [skipThisShit, setSkipThisShit] = useState(false);

  if (!skipThisShit) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <iframe
          src="https://vlipsy.com/embed/tZtlBPgQ"
          className="w-full h-full"
        />
        <div
          className="absolute bottom-0 mb-10 z-99 text-white"
          onClick={() => setSkipThisShit(true)}
        >
          Omitir esto, o no...
        </div>
      </div>
    );
  }

  return (
    <main className={`bg-red w-screen  ${ringbearer.className}`}>
      <Navbar />
      <div>{children}</div>
    </main>
  );
}
