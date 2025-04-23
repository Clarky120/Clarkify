export interface IMatch {
  id: string;
  players: Record<string, IPlayer>;
  metadata: IMatchMetadata;
  scoreboard: Record<string, IMatchScoreboard>;
  timeline: IMatchTimeline[];
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
  rounds: IMatchRound[];
  amtRounds: number;
}

export interface IMatchRound {
  index: number;
  startTick: number;
  endTick: number;
}

export interface IMatchTimeline {
  type: "damage" | "death";
  tick: number;
  roundIndex: number;
}

export interface IMatchTimelineDamage extends IMatchTimeline {
  type: "damage";
  attackerId: string;
  attackerName: string;
  attackerTeamId: string;
  victimId: string;
  victimName: string;
  victimTeamId: string;
  damageArmor: number;
  damageHealth: number;
  weapon: string;
  hitGroup: string;
  newHealth: number;
  actualDamage: number;
  isGrenadeDamage: boolean;
}

export interface IMatchTimelineDeath extends IMatchTimeline {
  type: "death";
  attackerId: string;
  attackerName: string;
  attackerTeamId: string;
  attackerPosition: { x: number; y: number; z: number };
  attackerBlind: boolean;
  attackerInAir: boolean;
  victimId: string;
  victimName: string;
  victimTeamId: string;
  victimPosition: { x: number; y: number; z: number };
  assisterId: string | null;
  assisterName: string | null;
  assisterTeamId: string | null;
  assistedFlash: boolean;
  weapon: string;
  headshot: boolean;
  penetrated: number;
  noscope: boolean;
  thrusmoke: boolean;
  gameTime: number;
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
  twoKillRounds: number;
  threeKillRounds: number;
  fourKillRounds: number;
  fiveKillRounds: number;
  grenadeDamage: number;
  hltvRating: number;
}
