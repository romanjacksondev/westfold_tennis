// Components
// import { ModalProvider } from 'components/Modal'
// import { ToastContainer } from 'react-toastify'
// import { Bootstrap } from 'components/Bootstap'
import { AppProvider } from 'store'

// Assets
// import 'react-toastify/dist/ReactToastify.css'
import 'assets/styles/global.css'
// import 'config/aws.js'

const App = ({ Component, pageProps }) => {
  return (
    <AppProvider session={pageProps.session}>
      {/* <ModalProvider>
        <Bootstrap>
          <ToastContainer /> */}
          <Component {...pageProps} />
        {/* </Bootstrap>
      </ModalProvider> */}
    </AppProvider>
  )
}

export default App
