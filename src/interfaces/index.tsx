export interface Stat {
    id: string;
    name: string;
    matchesWon: number;
    matchesLost: number;
    gamesWon: number;
    gamesLost: number;
}

export interface TournamentCategoryPoint {
    initial_position: number;
    final_position: number;
    points: number;
}

export interface TournamentCategory {
    name: string;
    tournamentCategoryPoints: TournamentCategoryPoint[];
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
    tournamentCategoryId: string;
    tournamentCategory: TournamentCategory;
    matches: Match[];
}

export interface Player {
    id: string;
    name: string;
}

export interface TournamentCreateInput {
    name: string;
    venueId: string;
    championId: string;
    date: Date;
    tournamentCategoryId: string;
    champion: object;
    venue: object;
    surfaceId: string;
    tournamentCategory: object;
    players: [];
}

export interface PlayerStats {
    total: number;
    points: {
        [key: string]: number;
    };
}
