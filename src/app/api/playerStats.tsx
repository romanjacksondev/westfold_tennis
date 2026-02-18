import prisma from "lib/prisma";

export default async function handler(req, res) {

  let whereCondition = {}
  if (req.query.id) {
    whereCondition = {
      id: req.query.id
    }
  }


  try {
    const players = await prisma.player.findFirst({
      where: whereCondition,
      include: {
        player1Matches: {
          include: {
            sets: {
              include: {
                games: true
              }
            }
          }
        },
        player2Matches: {
          include: {
            sets: {
              include: {
                games: true
              }
            }
          }
        }
      }
    });
    const results = processData(players)
    res.status(200).json(results);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

const processData = (players) => {
  const stats = {
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    setsPlayed: 0,
    setsWon: 0,
    setsLost: 0
  }

  const a = [...players.player1Matches, ...players.player2Matches].forEach(match => {
    stats.matchesPlayed++
    if (match.winnerId == players.id) {
      stats.matchesWon++
    } else {
      stats.matchesLost++
    }

    match.sets.forEach(set => {
      stats.setsPlayed++
      if (set.winnerId == players.id) {
        stats.setsWon++
      } else {
        stats.setsLost++
      }
      set.games.forEach(game => {
        stats.gamesPlayed++
        if (game.winnerId == players.id) {
          stats.gamesWon++
        } else {
          stats.gamesLost++
        }
      })
    })
  });
  return stats
}