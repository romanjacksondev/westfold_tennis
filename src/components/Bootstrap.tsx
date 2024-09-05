import { useEffect, useState } from "react"
import { useActions } from "store/actions"

export const Bootstrap =  ({ children}: any) => {

    const [init, setInit] = useState(false)
    const { getVenues, getPlayers, getTournamentTypes, getTournaments } = useActions()

    useEffect(() => {
        if(!init){
            getTournaments()
            getPlayers()
            getVenues()
            getTournamentTypes()
            setInit(true)
        }
    }, [init])
    return <>{children}</>
}