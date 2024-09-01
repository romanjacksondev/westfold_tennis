import { useState, useEffect } from 'react';
import { useActions } from 'store/actions';
import LeaderboardTemplate from './Leaderboard.template';
import { calculatePlayerPoints } from "../../lib/helpers"

const LeaderboardView = () => {

    const { getLeaderboard } = useActions()
    const [leaderboard, setLeaderboard] = useState([])

    useEffect(() => {
        const getLeaderboardData = async () => {
            const data = await getLeaderboard()
            // Calcular y ordenar jugadores
            const playerPoints = calculatePlayerPoints(data,);
            const entries = Object.entries(playerPoints);
            entries.sort((a, b) => b[1] - a[1]);
            const sortedArray = entries.map(([key, value]) => ({ key, value }));
            setLeaderboard(sortedArray)
        }
        getLeaderboardData()
    }, [])

    return (
        <LeaderboardTemplate leaderboard={leaderboard}></LeaderboardTemplate>
    )
}

export default LeaderboardView;