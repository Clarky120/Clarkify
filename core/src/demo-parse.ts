import logger from "./logger";
import { Logger } from "winston";
import { getAdmin } from "./firebase";
import { IDemoParseTask } from "@clarkify/types/demo-parse";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export class DemoParseTask {
  private _matchId: string;
  private _logger: Logger;

  constructor(matchId: string) {
    this._logger = logger.child({ matchId });

    this._matchId = matchId;
  }

  public get id() {
    return this._matchId;
  }

  public async startTask() {
    const fb = getAdmin();
    const ref = fb.firestore().collection("parseTask").doc(this._matchId);

    const task: IDemoParseTask = {
      id: this._matchId,
      matchId: this._matchId,
      status: "pending",
      createdAt: dayjs().utc().toISOString(),
      updatedAt: dayjs().utc().toISOString(),
    };

    await ref.set(task);

    logger.info(`Demo Parse Task created`);
  }
}
