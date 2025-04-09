import logger from "./logger";
import { Logger } from "winston";
import { getAdmin } from "./firebase";
import { IDemoParseTask } from "@clarkify/types/demo-parse";
import {
  IMatchKills,
  IMatchMetadata,
  IMatchScoreboard,
  IPlayer,
} from "@clarkify/types/match";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { parseEvent, parseEvents, parseTicks } from "@laihoe/demoparser2";
import { randomUUID } from "crypto";
import fs from "fs";
import {
  IPlayerDeathEvent,
  IRoundEndEvent,
  IRoundStartEvent,
} from "@clarkify/types/demo-events";
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
   * @param taskId The id of the task to load
   * @returns Promise that resolves to a DemoParseTask instance
   */
  public static async load(taskId: string) {
    const instance = new DemoParseTask();
    await instance.load(taskId);
    return instance;
  }

  /**
   * Use DemoParseTask.create() instead
   */
  private constructor() {}

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
      const scoreboard = this.parseScoreboard(players, metadata);
      const kills = this.parseKills(players);

      this._match = await ParsedMatch.create({
        id: this._task.matchId,
        players: players,
        metadata: metadata,
        scoreboard: scoreboard,
        kills: kills,
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

    return {
      endTick: gameEndTick,
      amtRounds: filteredEvents.length,
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

  /**
   * Parses the scoreboard from the demo
   * @param players The players
   * @param metadata The metadata
   * @returns The scoreboard
   */
  private parseScoreboard(
    players: Record<string, IPlayer>,
    metadata: IMatchMetadata
  ): Record<string, IMatchScoreboard> {
    const allDeaths = parseEvent(
      this._filePath,
      "player_death",
      ["team_num"],
      ["total_rounds_played", "is_warmup_period"]
    ) as (IPlayerDeathEvent & {
      user_team_num?: number;
      attacker_team_num?: number;
      total_rounds_played?: string;
      is_warmup_period?: boolean;
    })[];

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

    for (const death of allDeaths) {
      if (death.is_warmup_period) continue;

      const victim = players[death.user_steamid];
      if (!victim) continue;

      const scoreEntry = aggregate.get(victim.steamid);
      if (scoreEntry) {
        scoreEntry.deaths++;
      }

      const attacker = players[death.attacker_steamid];
      /** attacker can be null if the attacker is the bomb or a suicide */
      if (attacker) {
        const scoreEntry = aggregate.get(attacker.steamid);
        if (scoreEntry) {
          scoreEntry.kills++;
          scoreEntry.totalDamage += death.dmg_health;
          if (death.headshot) {
            scoreEntry.headshots++;
          }
        }
      }

      if (death.assister_steamid) {
        const assister = players[death.assister_steamid];
        if (assister) {
          const scoreEntry = aggregate.get(assister.steamid);
          if (scoreEntry) {
            scoreEntry.assists++;
            scoreEntry.totalDamage += death.dmg_health;
            if (death.headshot) {
              scoreEntry.headshots++;
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

  private parseKills(players: Record<string, IPlayer>): IMatchKills[] {
    const allDeaths = parseEvent(
      this._filePath,
      "player_death",
      ["team_num"],
      ["total_rounds_played", "is_warmup_period"]
    ) as (IPlayerDeathEvent & {
      user_team_num?: number;
      attacker_team_num?: number;
      total_rounds_played?: string;
      is_warmup_period?: boolean;
    })[];

    const kills: IMatchKills[] = [];

    for (const death of allDeaths) {
      if (death.is_warmup_period) continue;

      const victim = players[death.user_steamid];
      if (!victim) continue;

      const attacker = players[death.attacker_steamid];
      if (!attacker) continue;

      kills.push({
        attackerId: attacker.steamid,
        attackerName: attacker.name,
        attackerTeamId: attacker.team_num.toString(),
        victimId: victim.steamid,
        victimName: victim.name,
        victimTeamId: victim.team_num.toString(),
        weapon: death.weapon,
        tick: death.tick,
        roundIndex: Number(death.total_rounds_played),
      });
    }

    return kills;
  }
}
