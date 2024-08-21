import { useEffect, useState } from "react"
import { useActions } from "store/actions"

export const Bootstrap =  ({ children}: any) => {

    const [init, setInit] = useState(false)
    const { getTournaments } = useActions()

    useEffect(() => {
        if(!init){
            getTournaments()
            setInit(true)
        }
    })
    return <>{children}</>
}