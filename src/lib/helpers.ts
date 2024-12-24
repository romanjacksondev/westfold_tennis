import { TournamentCategory, Tournament, Stat, PlayerStats, PointsBreakdown } from 'interfaces';

export const getNestedProperty = (obj: any, reference: string) => {
    return reference.split('.').reduce((o, k) => o && o[k], obj)
}

export const formatNumber = (x, decimals = null) => {
    let parts = decimals ? toFixed(x * 100, decimals) : x
    parts = parts.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return parts.join('.')
}

export const toFixed = (value, precision) => {
    const power = Math.pow(10, precision || 0)
    return String(Math.round(value * power) / power)
}

export const calculatePlayerStats = (matches): Stat[] => {
    const playerStats = {};
    matches.forEach(match => {
        const { winnerId, player1Id, player2Id, sets } = match;

        // Inicializa los jugadores en el objeto playerStats si no existen
        if (!playerStats[player1Id]) {
            playerStats[player1Id] = {
                id: player1Id,
                name: match.player1?.name || 'Unknown',
                matchesWon: 0,
                matchesLost: 0,
                gamesWon: 0,
                gamesLost: 0
            };
        }

        if (!playerStats[player2Id]) {
            playerStats[player2Id] = {
                id: player2Id,
                name: match.player2?.name || 'Unknown',
                matchesWon: 0,
                matchesLost: 0,
                gamesWon: 0,
                gamesLost: 0
            };
        }

        // Determina el resultado del partido para cada jugador
        const matchResult = (winnerId === player1Id) ? player1Id : player2Id;
        const losingPlayer = (winnerId === player1Id) ? player2Id : player1Id;

        // Incrementa las estadísticas de los jugadores
        playerStats[matchResult].matchesWon += 1;
        playerStats[losingPlayer].matchesLost += 1;

        sets.forEach(set => {
            const { games } = set;

            games.forEach(game => {
                const { winnerId: gameWinnerId } = game;

                if (!playerStats[gameWinnerId]) {
                    playerStats[gameWinnerId] = {
                        id: gameWinnerId,
                        name: gameWinnerId === player1Id ? match.player1?.name : match.player2?.name,
                        matchesWon: 0,
                        matchesLost: 0,
                        gamesWon: 0,
                        gamesLost: 0
                    };
                }

                playerStats[gameWinnerId].gamesWon += 1;

                const gameLoserId = (gameWinnerId === player1Id) ? player2Id : player1Id;

                if (!playerStats[gameLoserId]) {
                    playerStats[gameLoserId] = {
                        id: gameLoserId,
                        name: gameLoserId === player1Id ? match.player1?.name : match.player2?.name,
                        matchesWon: 0,
                        matchesLost: 0,
                        gamesWon: 0,
                        gamesLost: 0
                    };
                }

                playerStats[gameLoserId].gamesLost += 1;
            });
        });
    });

    // Convierte el objeto playerStats en un array
    const statsArray: Stat[] = Object.values(playerStats);

    // Ordena el array por cantidad de partidos ganados, diferencia de juegos y juegos ganados
    statsArray.sort((a, b) => {
        // Primero, ordenar por cantidad de partidos ganados en orden descendente
        if (b.matchesWon !== a.matchesWon) {
            return b.matchesWon - a.matchesWon;
        }

        // Luego, ordenar por diferencia entre juegos ganados y perdidos en orden descendente
        const diffA = a.gamesWon - a.gamesLost;
        const diffB = b.gamesWon - b.gamesLost;
        if (diffB !== diffA) {
            return diffB - diffA;
        }

        // Finalmente, ordenar por cantidad de juegos ganados en orden descendente
        return b.gamesWon - a.gamesWon;
    });

    return statsArray;
};

// Función para obtener los puntos para una posición
export const getPointsForPosition = (tournamentCategory: TournamentCategory, position: number): number => {

    const pointEntry = tournamentCategory.tournamentCategoryPoints.find(
        (entry) => position >= entry.initial_position && position <= entry.final_position
    );
    return pointEntry ? pointEntry.points : 0;
};

// Función para calcular puntos totales por jugador
export const calculatePlayerPoints = (tournaments: Tournament[]): Record<string, PointsBreakdown> => {
    const playerPoints: Record<string, PointsBreakdown> = {};
    for (let indexFor = 0; indexFor < tournaments.length; indexFor++) {
        // console.log("nombre torneo: ",tournaments[indexFor].name)

        const positions = calculatePlayerStats(tournaments[indexFor].matches)
        // console.log("positions: ",positions)
        positions.forEach((position, index) => {
            const points = getPointsForPosition(tournaments[indexFor].tournamentCategory, index + 1);
            // console.log("index+1 "  + index+1)    
            // console.log("points " + points + " para " + position.name + " en el torneo " + tournaments[indexFor].name)

            if (!playerPoints[position.name]) {
                const data: PointsBreakdown = {
                    points: 0,
                    breakdown: []
                }
                // playerPoints[position.name] = 0;
                playerPoints[position.name] = data;
            }
            playerPoints[position.name].points += points;
            playerPoints[position.name].breakdown.push({ points: points, tournament: tournaments[indexFor].name })
        });
        //  console.log("breakdown: ", playerPoints)
    }
    return playerPoints;
};

export const createH2H = (matches) => {
    // Inicializamos un objeto para guardar los resultados
    const results = {};
    // Iteramos sobre cada partido en los datos
    matches.forEach(match => {
        // Obtenemos los nombres de los jugadores y el ganador

        const jugador1 = match.player1.name;
        const jugador2 = match.player2.name;
        const ganador = match.winner.name;

        // Inicializamos los jugadores en el objeto si no están
        if (!results[jugador1]) {
            results[jugador1] = { won: {}, lost: {} };
        }
        if (!results[jugador2]) {
            results[jugador2] = { won: {}, lost: {} };
        }

        // Determinamos el resultado del partido para cada jugador
        if (ganador === jugador1) {
            // El jugador1 ganó
            if (!results[jugador1].won[jugador2]) {
                results[jugador1].won[jugador2] = 0;
            }
            if (!results[jugador2].lost[jugador1]) {
                results[jugador2].lost[jugador1] = 0;
            }
            results[jugador1].won[jugador2]++;
            results[jugador2].lost[jugador1]++;
        } else if (ganador === jugador2) {
            // El jugador2 ganó
            if (!results[jugador2].won[jugador1]) {
                results[jugador2].won[jugador1] = 0;
            }
            if (!results[jugador1].lost[jugador2]) {
                results[jugador1].lost[jugador2] = 0;
            }
            results[jugador2].won[jugador1]++;
            results[jugador1].lost[jugador2]++;
        }
    });

    return results;
}

export const countTournamentsByPlayer = (tournaments) => {
    // Crear un objeto para almacenar las estadísticas
    const stats: Record<string, PlayerStats> = {};

    // Iterar sobre el array de torneos
    tournaments.forEach(tournament => {
        const winner = tournament.champion.name;
        const points = tournament.tournamentCategory.name;

        // Si el jugador no está en el objeto stats, inicializar su entrada
        if (!stats[winner]) {
            stats[winner] = {
                total: 0,
                points: {}
            };
        }

        // Incrementar el total de torneos ganados
        stats[winner].total += 1;

        // Incrementar la cantidad de puntos en la categoría correspondiente
        if (!stats[winner].points[points]) {
            stats[winner].points[points] = 0;
        }
        stats[winner].points[points] += 1;
    });

    // Convertir el objeto stats a un array de objetos
    const resultArray = Object.entries(stats).map(([name, { total, points }]) => ({
        name,
        total,
        points
    }));

    // Ordenar el array por la cantidad de torneos ganados en orden descendente
    resultArray.sort((a, b) => b.total - a.total);

    return resultArray;
}

export const generateDraw = (n, ps) => {  // n = num players

    const DUMMY = -1;

    const rs = [];                  // rs = round array
    if (!ps) {
        ps = [];
        for (let k = 1; k <= n; k += 1) {
            ps.push(k);
        }
    } else {
        ps = ps.slice();
    }

    if (n % 2 === 1) {
        ps.push(DUMMY); // so we can match algorithm for even numbers
        n += 1;
    }
    for (let j = 0; j < n - 1; j += 1) {
        rs[j] = []; // create inner match array for round j
        for (let i = 0; i < n / 2; i += 1) {
            const o = n - 1 - i;
            if (ps[i] !== DUMMY && ps[o] !== DUMMY) {
                // flip orders to ensure everyone gets roughly n/2 home matches
                const isHome = i === 0 && j % 2 === 1;
                // insert pair as a match - [ away, home ]
                rs[j].push([isHome ? ps[o] : ps[i], isHome ? ps[i] : ps[o]]);
            }
        }
        ps.splice(1, 0, ps.pop()); // permutate for next round
    }
    return rs;
};

export const createMatchSummary = (matchesList) => {
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


export const parseMatches = (matchesList) => {
    const data = []
    matchesList.map(match => {

        data.push({
            tournamentName: match.tournament.name,
            player1: match.player1.name,
            result: "resultado",
            player2: match.player2.name,
        }
        )
    })

    //Invierto el array para mostrar los partidos mas recientes primero
    return data.reverse()


}