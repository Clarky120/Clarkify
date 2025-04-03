import logger from "./logger";
import { Logger } from "winston";
import { getAdmin } from "./firebase";
import { IDemoParseTask } from "@clarkify/types/demo-parse";
import { IMatch } from "@clarkify/types/match";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { parseEvent, parseTicks } from "@laihoe/demoparser2";
import { randomUUID } from "crypto";
import fs from "fs";
dayjs.extend(utc);

export class DemoParseTask {
  private _logger!: Logger;
  private _task!: IDemoParseTask;
  private _isReady: boolean = false;

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
      instance._isReady = true;
      return instance;
    }

    if (options.matchId) {
      await instance.setup(options.matchId);
      instance._isReady = true;
      return instance;
    }

    throw new Error("You need to provide a task or matchId to setup the task");
  }

  /**
   * Use DemoParseTask.create() instead
   */
  private constructor() {}

  /**
   * Returns whether the task is ready for use
   */
  public get isReady(): boolean {
    return this._isReady;
  }

  public get task() {
    return this._task;
  }

  public set task(task: IDemoParseTask) {
    this._task = task;
    this.setupLogger();
  }

  public get hasLocalFile(): boolean {
    if (!this._task || !this._task.matchId) return false;
    return fs.existsSync(`/tmp/${this._task.matchId}.dem`);
  }

  private async setup(matchId: string) {
    const fb = getAdmin();
    const id = randomUUID();
    const taskRef = fb.firestore().collection("parse-tasks").doc(id);

    const task: IDemoParseTask = {
      id: id,
      matchId: matchId,
      status: "pending",
      createdAt: dayjs().utc().toISOString(),
      updatedAt: dayjs().utc().toISOString(),
    };

    await taskRef.set(task);

    this.task = task;
    this._logger.info(`Demo Parse Task created`);
  }

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

  private setupLogger() {
    this._logger = logger.child({ matchId: this._task.matchId });
  }

  /**
   * Parse the demo data and update the task status
   */
  public async parseData() {
    if (!this._isReady) {
      throw new Error(
        "Task is not ready. Make sure to create the task using DemoParseTask.create()"
      );
    }

    const fb = getAdmin();
    const taskRef = fb.firestore().collection("parse-tasks").doc(this._task.id);
    const matchRef = fb
      .firestore()
      .collection("matches")
      .doc(this._task.matchId);

    try {
      await this.downloadDemo();
    } catch (err) {
      this._logger.error(err);

      /** Set task as failed */
      const update: Partial<IDemoParseTask> = {
        status: "failed",
        error: {
          message: "Demo download failed",
          stack: err instanceof Error ? err.stack : "",
        },
        updatedAt: dayjs().utc().toISOString(),
      };
      await taskRef.update(update);
      return;
    }

    this._logger.info(`Starting demo parse...`);

    try {
      const gameEndTick = Math.max(
        ...parseEvent(`/tmp/${this._task.matchId}.dem`, "round_end").map(
          (x: any) => x.tick
        )
      );

      const fields = [
        "kills_total",
        "deaths_total",
        "mvps",
        "headshot_kills_total",
        "ace_rounds_total",
        "score",
      ];

      const data = parseTicks(`/tmp/${this._task.matchId}.dem`, fields, [
        gameEndTick,
      ]);

      const batch = getAdmin().firestore().batch();

      /** Create match data */
      const match: IMatch = {
        id: this._task.matchId,
        data: data,
        createdAt: dayjs().utc().toISOString(),
        updatedAt: dayjs().utc().toISOString(),
      };
      batch.set(matchRef, match);

      /** Update task */
      const update: Partial<IDemoParseTask> = {
        status: "completed",
        updatedAt: dayjs().utc().toISOString(),
      };
      batch.update(taskRef, update);

      await batch.commit();
    } catch (err) {
      /** Set task as failed */
      const update: Partial<IDemoParseTask> = {
        status: "failed",
        error: {
          message: "Demo parse failed",
          stack: err instanceof Error ? err.stack : "",
        },
        updatedAt: dayjs().utc().toISOString(),
      };
      await taskRef.update(update);

      this._logger.error(err);
    }
  }
}
