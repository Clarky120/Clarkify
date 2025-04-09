export interface IMatch {
  id: string;
  players: Record<string, IPlayer>;
  metadata: IMatchMetadata;
  scoreboard: Record<string, IMatchScoreboard>;
  kills: IMatchKills[];
  createdAt: string;
  updatedAt: string;
}

export interface IPlayer {
  name: string;
  steamid: string;
  team_num: number;
}

export interface IMatchMetadata {
  endTick: number;
  amtRounds: number;
}

export interface IMatchScoreboard {
  teamId: string;
  playerId: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  headshotPercentage: number;
}

export interface IMatchKills {
  attackerId: string;
  attackerName: string;
  attackerTeamId: string;
  victimId: string;
  victimName: string;
  victimTeamId: string;
  weapon: string;
  tick: number;
  roundIndex: number;
}
