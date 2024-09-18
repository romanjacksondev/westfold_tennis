import { useState, useEffect } from 'react';
import EstadisticasTemplate from './Estadisticas.template';
import { useActions } from 'store/actions';
import { createH2H, countTournamentsByPlayer } from 'lib/helpers';

const EstadisticasView = () => {

    const { getMatches, getTournaments } = useActions()
    const [h2h, setH2h] = useState({})
    const [championships, setChampionships] = useState([])

    useEffect(() => {
        const prepareH2H = async () => {
            const data = await getMatches("")
            const result = createH2H(data)
            setH2h(result)
        }

        const prepareChampionships = async () => {
            const data = await getTournaments()
            const result = countTournamentsByPlayer(data)
            setChampionships(result)
        }

        prepareH2H()
        prepareChampionships()

    }, [])

    return (
        <>

            <EstadisticasTemplate h2h={h2h} championships={championships}></EstadisticasTemplate>

        </>
    )
}

export default EstadisticasView;