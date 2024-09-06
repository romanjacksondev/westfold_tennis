import { useEffect, useState } from "react"
import { useActions } from "store/actions"

export const Bootstrap =  ({ children}: any) => {

    const [init, setInit] = useState(false)
    const { getVenues, getPlayers, getTournamentCategories, getTournaments, getSurfaces } = useActions()

    useEffect(() => {
        if(!init){
            getTournaments()
            getPlayers()
            getVenues()
            getTournamentCategories()
            getSurfaces()
            setInit(true)
        }
    }, [init])
    return <>{children}</>
}