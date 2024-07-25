// import Layout from "../../components/Layout";
// import "../styles/globals.css";
// import { AppProps } from "next/app";

// function App({ Component, pageProps }: AppProps) {
//   return (
//     <Layout>
//       <Component {...pageProps} />
//     </Layout>
//   );
// }

import { AppProvider } from 'store'
import "../styles/globals.css";

const App = ({ Component, pageProps }) => {
  <AppProvider session={pageProps.session}>
    <Component {...pageProps} />
  </AppProvider>
}

export default App;
