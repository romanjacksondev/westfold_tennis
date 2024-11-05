import { calculatePlayerStats } from "lib/helpers";
import prisma from "lib/prisma";

export default async function handler(req, res) {

    let whereCondition = {}
    if (req.query.id) {
        whereCondition = {
            tournamentId: req.query.id
        }
    }

    try {
        const matches = await prisma.match.findMany({
            where: whereCondition,
            include: {
                tournament: {
                    select: {
                        name: true,
                        champion: {
                            select: { name: true },
                        }
                    }
                },
                player1: {
                    select: { name: true },
                },
                player2: {
                    select: { name: true },
                },
                winner: {
                    select: { name: true },
                },
                sets: {
                    include: {
                        games: true
                    }
                }
            }
        });

        const matchSummary = processData(matches);
        const playerStats = calculatePlayerStats(matches)
        const data = {
            matchSummary, playerStats
        }
        res.status(200).json(data);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}

const processData = (matchesList) => {
    // console.log("matchesList: ", JSON.stringify(matchesList))
    const data = []
    matchesList.map(match => {
        const matchData = {
            player1Name: match.player1,
            player2Name: match.player2,
            player1Id: match.player1Id,
            player2Id: match.player2Id,
            sets: []
        }
        match.sets.map(set => {
            const setData = {
                gamesJugador1: 0,
                gamesJugador2: 0
            }
            set.games.map(game => {
                if (game.winnerId == matchData.player1Id) {
                    setData.gamesJugador1++
                } else {
                    setData.gamesJugador2++
                }
            })
            matchData.sets.push(setData)
        })
        data.push(matchData)
    })
    // console.log("data: ", JSON.stringify(data))
    return data

}