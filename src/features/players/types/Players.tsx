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
  imageUrl: string;
};
