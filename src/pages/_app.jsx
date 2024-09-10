// Components
import { ModalProvider } from 'components/Modal'
import { ToastContainer } from 'react-toastify'
import { Bootstrap } from 'components/Bootstrap'
import { AppProvider } from 'store'
import { SessionProvider } from "next-auth/react";
// Assets
import 'react-toastify/dist/ReactToastify.css'
import 'assets/styles/global.css'

const App = ({ Component, pageProps: { session, ...pageProps } }) => {

  return (
    <AppProvider session={pageProps.session}>
      <ModalProvider>
        <Bootstrap>
          <SessionProvider session={session}>
            <ToastContainer />
            <Component {...pageProps} />
          </SessionProvider>
        </Bootstrap>
      </ModalProvider>
    </AppProvider>
  )
}

export default App
