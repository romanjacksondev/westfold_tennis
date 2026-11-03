export type TennisPlayerProps = {
  id: string;
  name: string;
  lastname: string;
  nickname: string;
  country?: string;
  ranking?: number;
  points?: number;
  winLossRatio?: string;
  grandSlams?: number;
  photoUrl?: string | null;
  photoThumbUrl?: string | null;
  stats?: {
    matchesWon: number;
    matchesLost: number;
    gamesWon: number;
    gamesLost: number;
    setsWon?: number;
    setsLost?: number;
  };
};
