import { useState } from "react";
import Navbar from "./navbar";
import localFont from "next/font/local";
const ringbearer = localFont({
  src: "../assets/font/ringbearer/ringbearer.woff",
});

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="container">{children}</div>
    </>
  );
}
