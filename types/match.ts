export interface IMatch {
  id: string;
  scoreboard: IMatchScoreboard[];
  createdAt: string;
  updatedAt: string;
}

export interface IMatchScoreboard {
  teamId: string;
  playerId: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
}
