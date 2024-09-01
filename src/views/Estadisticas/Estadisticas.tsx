import { useState, useEffect } from 'react';
import EstadisticasTemplate from './Estadisticas.template';
import { useActions } from 'store/actions';
import { createH2H } from 'lib/helpers';

const EstadisticasView = () => {

    const { getMatches } = useActions()
    const [h2h, setH2h] = useState({})

    useEffect(() => {
        const prepareStats = async () => {
            const data = await getMatches("")
            const result = createH2H(data)
            console.log(result)
            setH2h(result)
        }
        prepareStats()
    }, [])

    return (
        <EstadisticasTemplate h2h={h2h}></EstadisticasTemplate>
    )
}

export default EstadisticasView;