// import App from 'next/app';
import * as React from 'react'
import { rootReducer } from './reducers';
type AppProviderProps = {
    children: React.ReactNode
    session: any
}

const AppContext = React.createContext(null);

const AppProvider = ({children, session}: AppProviderProps) => {
    const initialState = {}
    const [state, dispatch] = React.useReducer(rootReducer, initialState);
    const store = React.useMemo(() => [state, dispatch], [state]);
    const value = { state: store[0], dispatch: store[1]}
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

const useAppContext = () => {
    const context = React.useContext(AppContext);
    return context;
}

export {AppProvider, useAppContext}