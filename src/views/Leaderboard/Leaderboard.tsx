import { useState, useEffect } from 'react';
import { useActions } from 'store/actions';
import LeaderboardTemplate from './Leaderboard.template';
import { calculatePlayerPoints } from "../../lib/helpers"
import { Player } from './Leaderboard.interfaces';


const LeaderboardView = () => {

    const { getLeaderboard, getPlayers } = useActions()
    const [leaderboard, setLeaderboard] = useState([])

    useEffect(() => {
        const getLeaderboardData = async () => {
            const data = await getLeaderboard()
            // console.log(data)
            // Calcular y ordenar jugadores
            const playerPoints = calculatePlayerPoints(data,);

const players: Player[] = await getPlayers()
const sortedPlayers = Object.entries(playerPoints)
    .map(([playerId, points]) => ({ playerId, points, name: players.find(player => player.id === playerId).name || 'Unknown' }))
    .sort((a, b) => b.points - a.points);

            // console.log(sortedPlayers);

            setLeaderboard(sortedPlayers)
        }
        getLeaderboardData()
    }, [])

    return (
        <LeaderboardTemplate leaderboard={leaderboard}></LeaderboardTemplate>
    )
}

export default LeaderboardView;