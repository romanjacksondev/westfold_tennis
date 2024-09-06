import { TournamentCategory, Tournament, Stat } from 'interfaces';

export const getNestedProperty = (obj: any, reference: string) => {
    return reference.split('.').reduce((o, k) => o && o[k], obj)
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

        sets && sets.forEach(set => {
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
export const calculatePlayerPoints = (tournaments: Tournament[]): Record<string, number> => {
    const playerPoints: Record<string, number> = {};
    for (let indexFor = 0; indexFor < tournaments.length; indexFor++) {
        // console.log(tournaments[indexFor].name)

        const positions = calculatePlayerStats(tournaments[indexFor].matches)
        // console.log(positions)
        positions.forEach((position, index) => {
            const points = getPointsForPosition(tournaments[indexFor].tournamentCategory, index + 1);
            // console.log("index+1 "  + index+1)    
            // console.log("points " + points + " para " + position.name)
            if (!playerPoints[position.name]) {
                playerPoints[position.name] = 0;
            }
            playerPoints[position.name] += points;
        });
        // console.log(playerPoints)
    }
    return playerPoints;
};


export const createH2H = (matches) => {
    // Inicializamos un objeto para guardar los resultados
    const results = {};
    // debugger
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
  const stats = {};

  // Iterar sobre el array de torneos
  tournaments.forEach(tournament => {
    const winner = tournament.winner.name;
    const points = tournament.venue.points;

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