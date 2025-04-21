export interface IPlayerDeathEvent {
  assistedflash: boolean;
  assister_name: string | null;
  assister_steamid: string | null;
  attacker_name: string;
  attacker_steamid: string;
  attackerblind: boolean;
  attackerinair: boolean;
  distance: number;
  dmg_armor: number;
  dmg_health: number;
  dominated: number;
  event_name: string;
  headshot: boolean;
  hitgroup: string;
  noreplay: boolean;
  noscope: boolean;
  penetrated: number;
  revenge: number;
  thrusmoke: boolean;
  tick: number;
  user_name: string;
  user_steamid: string;
  weapon: string;
  weapon_fauxitemid: string;
  weapon_itemid: string;
  weapon_originalowner_xuid: string;
  wipe: number;
}

export interface IRoundStartEvent {
  event_name: string;
  is_warmup_period: boolean;
  round: number;
  tick: number;
}

export interface IRoundEndEvent {
  event_name: string;
  is_warmup_period: boolean;
  reason: string;
  round: number;
  tick: number;
  winner: string;
}

export interface IPlayerHurtEvent {
  armor: number;
  attacker_name: string;
  attacker_steamid: string;
  attacker_team_num: number;
  dmg_armor: number;
  dmg_health: number;
  event_name: string;
  health: number;
  hitgroup: string;
  is_warmup_period: boolean;
  tick: number;
  total_rounds_played: number;
  user_name: string;
  user_steamid: string;
  user_team_num: number;
  weapon: string;
}

// >    {
//   >      armor: 94,
//   >      attacker_name: 'Aspland',
//   >      attacker_steamid: '76561198024334706',
//   >      attacker_team_num: 3,
//   >      dmg_armor: 6,
//   >      dmg_health: 13,
//   >      event_name: 'player_hurt',
//   >      health: 87,
//   >      hitgroup: 'right_arm',
//   >      is_warmup_period: false,
//   >      tick: 2484,
//   >      total_rounds_played: 0,
//   >      user_name: 'Minimal',
//   >      user_steamid: '76561198093584374',
//   >      user_team_num: 2,
//   >      weapon: 'hkp2000'
//   >    },
