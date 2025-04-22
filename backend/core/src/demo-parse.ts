import logger from "./logger";
import { Logger } from "winston";
import { getAdmin } from "./firebase";
import { IDemoParseTask, TDemoParseTaskStatus } from "@clarkify/types";
import {
  IMatchMetadata,
  IMatchRound,
  IMatchScoreboard,
  IMatchTimeline,
  IMatchTimelineDamage,
  IMatchTimelineDeath,
  IPlayer,
} from "@clarkify/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { parseEvent, parseEvents, parseTicks } from "@laihoe/demoparser2";
import { randomUUID } from "crypto";
import fs from "fs";
import {
  IPlayerDeathEvent,
  IPlayerHurtEvent,
  IRoundStartEvent,
} from "@clarkify/types";
import { ParsedMatch } from "./match";
dayjs.extend(utc);

export class DemoParseTask {
  private _logger!: Logger;
  private _task!: IDemoParseTask;
  private _filePath!: string;
  private _match!: ParsedMatch;

  /**
   * Factory method to create a DemoParseTask instance
   * @param options Options to create the task
   * @returns Promise that resolves to a DemoParseTask instance
   */
  public static async create(options: {
    task?: IDemoParseTask;
    matchId?: string;
  }): Promise<DemoParseTask> {
    const instance = new DemoParseTask();

    if (options.task) {
      instance.task = options.task;
      instance._filePath = `/tmp/${options.task.matchId}.dem`;
      return instance;
    }

    if (options.matchId) {
      await instance.create(options.matchId);
      instance._filePath = `/tmp/${options.matchId}.dem`;
      return instance;
    }

    throw new Error("You need to provide a task or matchId to setup the task");
  }

  /**
   * Factory method to load a DemoParseTask instance
   * @param options Options to load the task
   * @param options.taskId The id of the task to load
   * @param options.task The task data to use
   * @returns Promise that resolves to a DemoParseTask instance
   */
  public static async load(options: {
    taskId?: string;
    task?: IDemoParseTask;
  }) {
    const instance = new DemoParseTask();

    if (options.taskId) {
      await instance.load(options.taskId);
    } else if (options.task) {
      instance.task = options.task;
    }

    return instance;
  }

  /**
   * Use DemoParseTask.create() instead
   */
  private constructor() { }

  /**
   * Returns the task
   */
  public get task() {
    return this._task;
  }

  /**
   * Sets the task
   * @param task The task to set
   */
  private set task(task: IDemoParseTask) {
    if (this._task) {
      throw new Error("Task already set");
    }

    this._task = task;
    this._logger = logger.child({ taskId: this._task.id });
  }

  public get match() {
    return this._match;
  }

  /**
   * Returns whether the local demo file exists
   */
  public get hasLocalFile(): boolean {
    if (!this._task || !this._task.matchId) return false;
    return fs.existsSync(this._filePath);
  }

  /**
   * Saves the task to the database
   * @param update The update to save
   * @param batch The batch to save the update to
   */
  private async save(
    update: Partial<IDemoParseTask>,
    batch?: FirebaseFirestore.WriteBatch
  ) {
    const fb = getAdmin();
    const taskRef = fb.firestore().collection("parse-tasks").doc(this._task.id);

    const withDates = {
      ...update,
      updatedAt: dayjs().utc().toISOString(),
    };

    if (update.id) {
      withDates.createdAt = dayjs().utc().toISOString();
    }

    if (batch) {
      batch.set(taskRef, withDates, { merge: true });
    } else {
      await taskRef.set(withDates, { merge: true });
    }

    this._task = {
      ...this._task,
      ...withDates,
    };

    this._logger.info(`Demo Parse Task updated`, withDates);
  }

  /**
   * Loads the task from the database
   * @param taskId The id of the task to load
   */
  private async load(taskId: string) {
    const fb = getAdmin();

    const taskRef = fb.firestore().collection("parse-tasks").doc(taskId);
    const task = await taskRef.get();
    if (!task.exists) {
      throw new Error("Task not found");
    }

    this.task = task.data() as IDemoParseTask;
  }

  /**
   * Creates a new task document in the database
   * @param matchId The id of the match to create the task for
   */
  private async create(matchId: string) {
    const id = randomUUID();

    const task: IDemoParseTask = {
      id: id,
      matchId: matchId,
      status: "pending",
      createdAt: dayjs().utc().toISOString(),
      updatedAt: dayjs().utc().toISOString(),
    };

    this.task = task;
    await this.save(task);

    this._logger.info(`Demo Parse Task created`);
  }

  public async updateStatus(status: TDemoParseTaskStatus) {
    await this.save({
      status: status,
      updatedAt: dayjs().utc().toISOString(),
    });
  }

  /**
   * Downloads the demo from the storage bucket
   */
  private async downloadDemo() {
    if (this.hasLocalFile) return;

    this._logger.info(`Starting demo download...`);

    const fb = getAdmin();
    await fb
      .storage()
      .bucket()
      .file(`demos/${this._task.matchId}.dem`)
      .download({
        destination: `/tmp/${this._task.matchId}.dem`,
      });

    this._logger.info(`Demo downloaded successfully`);
  }

  /**
   * Runs the task and parses the demo
   */
  public async run() {
    this.save({
      status: "processing",
      updatedAt: dayjs().utc().toISOString(),
    });

    try {
      await this.downloadDemo();
    } catch (err) {
      this._logger.error(err);

      /** Set task as failed */
      await this.save({
        status: "failed",
        error: {
          message: "Demo download failed",
          stack: err instanceof Error ? err.stack : "",
        },
        updatedAt: dayjs().utc().toISOString(),
      });

      return;
    }

    this._logger.info(`Starting demo parse...`);

    try {
      const batch = getAdmin().firestore().batch();

      const metadata = this.parseMetadata();
      const players = this.parsePlayers(metadata);
      const timeline = this.parseTimeline(players, metadata);
      const scoreboard = this.parseScoreboard(players, metadata, timeline);

      this._match = await ParsedMatch.create({
        id: this._task.matchId,
        players: players,
        metadata: metadata,
        scoreboard: scoreboard,
        timeline: timeline,
        createdAt: dayjs().utc().toISOString(),
        updatedAt: dayjs().utc().toISOString(),
      });

      /** Update task */
      this.save(
        {
          status: "completed",
          updatedAt: dayjs().utc().toISOString(),
        },
        batch
      );

      await batch.commit();
    } catch (err) {
      this.save({
        status: "failed",
        error: {
          message: "Demo parse failed",
          stack: err instanceof Error ? err.stack : "",
        },
        updatedAt: dayjs().utc().toISOString(),
      });

      this._logger.error(err);
    }
  }

  /**
   * Parses the metadata from the demo
   * @returns The metadata
   */
  private parseMetadata(): IMatchMetadata {
    const allEvents = parseEvents(
      `/tmp/${this._task.matchId}.dem`,
      ["round_start", "round_end"],
      [],
      ["is_warmup_period"]
    ) as IRoundStartEvent[];

    const filteredEvents = allEvents.filter((x) => !x.is_warmup_period);
    const gameEndTick = Math.max(...filteredEvents.map((x: any) => x.tick));

    const rounds: IMatchRound[] = [];

    let currentRound = 0;
    for (const startEvent of filteredEvents.filter(
      (x) => x.event_name === "round_start"
    )) {
      const endEvent = filteredEvents.find(
        (x) => x.event_name === "round_end" && x.round === startEvent.round + 1
      );
      if (!endEvent) continue;

      rounds.push({
        index: currentRound,
        startTick: startEvent.tick,
        endTick: endEvent.tick,
      });

      currentRound++;
    }

    return {
      endTick: gameEndTick,
      rounds: rounds,
      amtRounds: filteredEvents.filter((x) => x.event_name === "round_end")
        .length,
    };
  }

  /**
   * Parses the players from the demo
   * @param metadata The metadata
   * @returns The players
   */
  private parsePlayers(metadata: IMatchMetadata): Record<string, IPlayer> {
    const allPlayerTicks = parseTicks(
      this._filePath,
      ["team_num"],
      [metadata.endTick]
    );

    const playerMap = new Map<string, IPlayer>();

    for (const player of allPlayerTicks) {
      playerMap.set(player.steamid, {
        steamid: player.steamid,
        name: player.name,
        team_num: player.team_num,
      });
    }

    return Object.fromEntries(playerMap);
  }

  private parseTimeline(
    players: Record<string, IPlayer>,
    metadata: IMatchMetadata
  ): IMatchTimeline[] {
    const allDamage = parseEvents(
      this._filePath,
      ["player_hurt"],
      ["team_num"],
      ["total_rounds_played", "is_warmup_period"]
    ) as IPlayerHurtEvent[];

    const dmgTimeline: IMatchTimelineDamage[] = [];

    // Track all damage first
    for (const damage of allDamage) {
      if (damage.is_warmup_period) continue;

      const victim = players[damage.user_steamid];
      if (!victim) {
        this._logger.warn(`Victim not found for damage`, damage);
        continue;
      }

      let attacker = players[damage.attacker_steamid];
      if (!attacker) {
        this._logger.warn(`Attacker not found for damage`, damage);
        continue;
      }

      const isSuicide = damage.attacker_steamid === damage.user_steamid;
      const isC4 = damage.weapon === "planted_c4";

      if (isSuicide) {
        attacker = {
          steamid: "suicide",
          name: "suicide",
          team_num: -1,
        };
      }

      if (isC4) {
        attacker = {
          steamid: "planted_c4",
          name: "planted_c4",
          team_num: -1,
        };
      }

      dmgTimeline.push({
        type: "damage",
        tick: damage.tick,
        roundIndex: Number(damage.total_rounds_played),
        attackerId: attacker.steamid,
        attackerName: attacker.name,
        attackerTeamId: attacker.team_num.toString(),
        victimId: victim.steamid,
        victimName: victim.name,
        victimTeamId: victim.team_num.toString(),
        damageArmor: damage.dmg_armor,
        damageHealth: damage.dmg_health,
        weapon: damage.weapon,
        hitGroup: damage.hitgroup,
        newHealth: damage.health,
        actualDamage: this.calcActualDamage(dmgTimeline, damage),
      });
    }

    const deathTimeline: IMatchTimelineDeath[] = [];

    const allDeaths = parseEvent(
      this._filePath,
      "player_death",
      ["team_num", "X", "Y", "Z"],
      ["total_rounds_played", "is_warmup_period"]
    ) as (IPlayerDeathEvent & {
      user_team_num: number;
      attacker_team_num: number;
      total_rounds_played: string;
      is_warmup_period: boolean;
      attacker_X: number;
      attacker_Y: number;
      attacker_Z: number;
      user_X: number;
      user_Y: number;
      user_Z: number;
    })[];

    for (const death of allDeaths) {
      if (death.is_warmup_period) continue;

      const isSuicide = death.attacker_steamid === death.user_steamid;
      const isC4 = death.weapon === "planted_c4";

      const victim = players[death.user_steamid];
      if (!victim) {
        this._logger.warn(`Victim not found for death`, death);
        continue;
      }

      const assister = death.assister_steamid
        ? players[death.assister_steamid]
        : null;

      let attacker = players[death.attacker_steamid];

      if (isSuicide) {
        attacker = {
          steamid: "suicide",
          name: "suicide",
          team_num: -1,
        };
      }

      if (isC4) {
        attacker = {
          steamid: "planted_c4",
          name: "planted_c4",
          team_num: -1,
        };
      }

      deathTimeline.push({
        type: "death",
        tick: death.tick,
        roundIndex: Number(death.total_rounds_played),
        attackerId: attacker.steamid,
        attackerName: attacker.name,
        attackerTeamId: attacker.team_num.toString(),
        attackerPosition: {
          x: death.attacker_X,
          y: death.attacker_Y,
          z: death.attacker_Z,
        },
        victimId: victim.steamid,
        victimName: victim.name,
        victimTeamId: victim.team_num.toString(),
        victimPosition: {
          x: death.user_X,
          y: death.user_Y,
          z: death.user_Z,
        },
        assisterId: assister?.steamid ?? null,
        assisterName: assister?.name ?? null,
        assisterTeamId: assister?.team_num.toString() ?? null,
        assistedFlash: death.assistedflash,
        attackerBlind: death.attackerblind,
        attackerInAir: death.attackerinair,
        weapon: death.weapon,
        headshot: death.headshot,
        penetrated: death.penetrated,
        noscope: death.noscope,
        thrusmoke: death.thrusmoke,
      });
    }

    return [...dmgTimeline, ...deathTimeline].sort((a, b) => a.tick - b.tick);
  }

  /**
   * Parses the scoreboard from the demo
   * @param players The players
   * @param metadata The metadata
   * @param timeline The match timeline containing damage and death events
   * @returns The scoreboard
   */
  private parseScoreboard(
    players: Record<string, IPlayer>,
    metadata: IMatchMetadata,
    timeline: IMatchTimeline[]
  ): Record<string, IMatchScoreboard> {
    /** Create blank aggregate for each player */
    const aggregate = new Map<
      string,
      {
        playerId: string;
        kills: 0;
        deaths: 0;
        assists: 0;
        totalDamage: 0;
        headshots: 0;
      }
    >();
    for (const player of Object.values(players)) {
      aggregate.set(player.steamid, {
        playerId: player.steamid,
        kills: 0,
        deaths: 0,
        assists: 0,
        totalDamage: 0,
        headshots: 0,
      });
    }

    // Process timeline events
    for (const event of timeline) {
      switch (event.type) {
        case "damage": {
          const damageEvent = event as IMatchTimelineDamage;
          const scoreEntry = aggregate.get(damageEvent.attackerId);
          if (scoreEntry) {
            scoreEntry.totalDamage +=
              damageEvent.actualDamage;
          }
          break;
        }

        case "death": {
          const deathEvent = event as IMatchTimelineDeath;
          // Track victim's death
          const victimScoreEntry = aggregate.get(deathEvent.victimId);
          if (victimScoreEntry) {
            victimScoreEntry.deaths++;
          }

          // Track attacker's kill
          const attackerScoreEntry = aggregate.get(deathEvent.attackerId);
          if (attackerScoreEntry) {
            attackerScoreEntry.kills++;
            if (deathEvent.headshot) {
              attackerScoreEntry.headshots++;
            }
          }

          // Track assister's assist
          if (deathEvent.assisterId) {
            const assisterScoreEntry = aggregate.get(deathEvent.assisterId);
            if (assisterScoreEntry) {
              assisterScoreEntry.assists++;
            }
          }
        }
      }
    }

    const scoreboard = new Map<string, IMatchScoreboard>();
    for (const [steamid, player] of Object.entries(players)) {
      const aggregateEntry = aggregate.get(steamid);
      if (!aggregateEntry) continue;

      scoreboard.set(steamid, {
        playerId: player.steamid,
        teamId: player.team_num.toString(),
        name: player.name,
        kills: aggregateEntry.kills,
        deaths: aggregateEntry.deaths,
        assists: aggregateEntry.assists,
        adr: Math.floor(aggregateEntry.totalDamage / metadata.amtRounds),
        headshotPercentage:
          aggregateEntry.kills === 0
            ? 0
            : Number(
              (aggregateEntry.headshots / aggregateEntry.kills).toFixed(2)
            ),
      });
    }

    return Object.fromEntries(scoreboard);
  }

  calcActualDamage(
    timeline: IMatchTimelineDamage[],
    hurtEvent: IPlayerHurtEvent
  ) {
    const sortedTimeline = timeline
      .filter(
        (f) =>
          f.victimId === hurtEvent.user_steamid &&
          f.tick < hurtEvent.tick &&
          f.roundIndex === hurtEvent.total_rounds_played
      )
      .sort((a, b) => b.tick - a.tick);

    if (sortedTimeline.length === 0) {
      return Math.min(hurtEvent.dmg_health, 100);
    }

    for (const tick of sortedTimeline) {
      const prevHealth = tick.newHealth;
      //They ded
      if (prevHealth - hurtEvent.dmg_health < 0) {
        return prevHealth;
      } else {
        //They not
        return hurtEvent.dmg_health;
      }
    }
    //Keeps compiler happy
    return 100;
  }
}
