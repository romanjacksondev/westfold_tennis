export interface Stat {
    id: string;
    name: string;
    matchesWon: number;
    matchesLost: number;
    gamesWon: number;
    gamesLost: number;
  }

export interface TournamentTypePoint {
    initial_position: number;
    final_position: number;
    points: number;
}

export interface TournamentType {
    name: string;
    tournamentTypePoints: TournamentTypePoint[];
}

export interface Match {
    id: string;
    winnerId: string;
    tournamentId: string;
    player1Id: string;
    player2Id: string;
}

export interface Tournament {
    id: string;
    name: string;
    venueId: string;
    winnerId: string;
    date: string;
    tournamentTypeId: string;
    tournamentType: TournamentType;
    matches: Match[];
}

export interface Player {
    id: string;
    name: string;
}

export interface TournamentCreateInput {
    name: string;
    venueId: string;
    winnerId: string;
    date: Date ;
    tournamentTypeId: string;
    winner: object;
    venue: object

  }