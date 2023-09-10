import path from "path";
import { promises as fs } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const jsonDirectory = path.join(process.cwd(), "data");

  //busco los torneos y filtro por id
  //Read the json data file data.json
  let fileContents = await fs.readFile(
    jsonDirectory + "/tournaments.json",
    "utf8"
  );
  const tournaments = JSON.parse(fileContents);
  const tournament = tournaments.tournaments.find((e) => e.id === id);
  //Read the json data file data.json
  fileContents = await fs.readFile(jsonDirectory + "/matches.json", "utf8");
  const matches = JSON.parse(fileContents);
  const filteredMatches = matches.matches.filter((e) =>
    tournament.matches.includes(e.id)
  );
  //Read the json data file data.json
  fileContents = await fs.readFile(jsonDirectory + "/players.json", "utf8");
  const players = JSON.parse(fileContents);
  const response = {
    players: players,
    matches: filteredMatches,
    tournamentName: tournament.name,
  };

  //Return the content of the data file in json format
  res.status(200).json(response);
}
