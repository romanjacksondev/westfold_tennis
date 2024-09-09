import { useEffect, useState } from "react"
import InfoPlayerTemplate from "./InfoPlayer.template"
import { countTournamentsByPlayer } from "lib/helpers"
import { useRouter } from "next/router"
import { useSelectors } from "store/selectors"

const InfoPlayerView = () => {
    const router = useRouter()
     const [championships, setChampionships] = useState([])
     const { tournaments } = useSelectors()
     useEffect(() => {
         const prepareChampionships = async () => {
            //  const data = await getTournaments()
             const filtro = tournaments.filter( tournament => tournament.championId == router.query.id)
             console.log(router.query.id)
             const result = countTournamentsByPlayer(filtro)
            console.log(result)
             setChampionships(result)
         }
         prepareChampionships()
     }, [])

    return (
        <>
            <InfoPlayerTemplate championships={championships}></InfoPlayerTemplate>
        </>
    )
}

export default InfoPlayerView