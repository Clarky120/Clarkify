export interface IPlayer {
  name: string;
  steamid: string;
  team_num: number;
}

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
