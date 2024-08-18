import * as React from 'react'
import { INITIAL_STATE } from './initialState'
import { rootReducer } from './reducers'
// import { getUserAttributes } from 'lib/utils/helpers'

type AppProviderProps = {
  children: React.ReactNode
  session: any
}

const AppContext = React.createContext(null)

const AppProvider = ({ children, session }: AppProviderProps) => {
  const initialState = {
    ...INITIAL_STATE,
    user: { attributes: {}, session: session || {} },
  }
  const [state, dispatch] = React.useReducer(rootReducer, initialState)
  const store = React.useMemo(() => [state, dispatch], [state])
  const value = { state: store[0], dispatch: store[1] }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

const useAppContext = () => {
  const context = React.useContext(AppContext)
  if (context === undefined) {
    throw new Error('method must be used within a AppProvider')
  }
  return context
}

export { AppProvider, useAppContext }
