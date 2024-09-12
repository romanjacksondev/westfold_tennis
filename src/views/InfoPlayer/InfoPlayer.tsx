import { useEffect, useState } from "react"
import InfoPlayerTemplate from "./InfoPlayer.template"
import { countTournamentsByPlayer } from "lib/helpers"
import { useRouter } from "next/router"
import { useSelectors } from "store/selectors"
import { useActions } from "store/actions"

const InfoPlayerView = () => {
    const router = useRouter()
    const [championships, setChampionships] = useState([])
    const [stats, setStats] = useState({})
    const { tournaments } = useSelectors()

    const { getPlayerStats } = useActions()

    useEffect(() => {
        const prepareChampionships = async () => {
            //  const data = await getTournaments()
            const filtro = tournaments.filter(tournament => tournament.championId == router.query.id)
            //  console.log(router.query.id)
            const result = countTournamentsByPlayer(filtro)
            // console.log(result)
            setChampionships(result)
        }
        prepareChampionships()
    }, [])

    useEffect(() => {
        const prepareStats = async () => {
            const result = await getPlayerStats(router.query.id)
            setStats(result)
        }
        prepareStats()
    }, [])

    return (
        <>
            <InfoPlayerTemplate 
                championships={championships} 
                stats={stats}
            />
            
        </>
    )
}

export default InfoPlayerView