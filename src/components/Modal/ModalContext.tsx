import {
  createContext,
  useState,
  useContext,
  useMemo,
  SetStateAction,
  Dispatch,
  useEffect,
} from 'react'

const DEFAULTS: {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
} = {
  isOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIsOpen: () => {},
}

const ModalContext = createContext(DEFAULTS)

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', onKeyPress)
    return () => window.removeEventListener('keydown', onKeyPress)
  }, [isOpen, setIsOpen])

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
    }),
    [isOpen]
  )

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModalContext = () => {
  const context = useContext(ModalContext)
  return context
}
