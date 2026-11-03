export type CardComponentType = {
  id: string | number;
  name: string;
  lastname: string;
  imageUrl: string | null;
  nickname: string;
  stats?: {
    matchesWon: number;
    matchesLost: number;
    gamesWon: number;
    gamesLost: number;
    setsWon?: number;
    setsLost?: number;
  };
};
