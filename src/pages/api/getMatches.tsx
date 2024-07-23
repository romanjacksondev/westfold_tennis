import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const matches = await prisma.match.findMany();
    const pro = matches.reduce((result, match) => {
      processMatch(result, match);
      return result;
    }, {});
    res.status(200).json( pro );
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

function processMatch(result, match) {
  const { player1h2h, player2h2h } = initializePlayers(result, match);

  if (match.player1Id === match.winnerId) {
    player1h2h.won++;
    player2h2h.lost++;
  } else {
    player1h2h.lost++;
    player2h2h.won++;
  }
}

function initializeResult(result, match) {
  if (!result[match.player1Id]) {
    result[match.player1Id] = [];
  }
  if (!result[match.player2Id]) {
    result[match.player2Id] = [];
  }
}

function initializePlayers(result, match) {
  initializeResult(result, match);
  let player1h2h = result[match.player1Id].find(
    (res) => res.id === match.player2Id
  );
  if (!player1h2h) {
    player1h2h = {
      id: match.player2Id,
      won: 0,
      lost: 0,
    };
    result[match.player1Id].push(player1h2h);
  }
  let player2h2h = result[match.player2Id].find(
    (res) => res.id === match.player1Id
  );
  if (!player2h2h) {
    player2h2h = {
      id: match.player1Id,
      won: 0,
      lost: 0,
    };
    result[match.player2Id].push(player2h2h);
  }
  return { player1h2h, player2h2h };
}
