// import Layout from "../components/Layout";
import Navbar from "../components/navbar";
import "../styles/globals.css";
import { AppProps } from "next/app";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar></Navbar>
      <Component {...pageProps} />
    </>
  );
}

export default App;
