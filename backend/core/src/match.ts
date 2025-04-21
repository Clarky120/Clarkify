import { IMatch } from "@clarkify/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getAdmin } from "./firebase";
import logger from "./logger";
import { Logger } from "winston";

dayjs.extend(utc);

export class ParsedMatch {
  private _match!: IMatch;
  private _logger!: Logger;

  constructor() {}

  /**
   * Factory method to create a ParsedMatch instance
   * @param match The match to create the instance for
   * @returns Promise that resolves to a ParsedMatch instance
   */
  public static async create(match: IMatch) {
    const instance = new ParsedMatch();
    instance.match = match;
    await instance.save();
    return instance;
  }

  /**
   * Factory method to load a ParsedMatch instance
   * @param matchId The id of the match to load
   * @returns Promise that resolves to a ParsedMatch instance
   */
  public static async load(matchId: string) {
    const instance = new ParsedMatch();
    await instance.load(matchId);
    return instance;
  }

  /**
   * Returns the match
   */
  public get match() {
    return this._match;
  }

  /**
   * Sets the match
   * @param match The match to set
   */
  private set match(match: IMatch) {
    if (this._match) {
      throw new Error("Match already set");
    }

    this._match = match;
    this._logger = logger.child({ matchId: this._match.id });
  }

  /**
   * Returns the scoreboard
   */
  public get scoreboard() {
    return this._match.scoreboard;
  }

  /**
   * Returns the metadata
   */
  public get metadata() {
    return this._match.metadata;
  }

  /**
   * Returns the players
   */
  public get players() {
    return this._match.players;
  }

  /**
   * Saves the match to the database
   * @param batch The batch to save the match to
   */
  private async save(batch?: FirebaseFirestore.WriteBatch) {
    const fb = getAdmin();
    const ref = fb.firestore().collection("matches").doc(this._match.id);

    const safeVal = {
      ...this._match,
      scoreboard: this._match.scoreboard,
      players: this._match.players,
      createdAt: dayjs().utc().toISOString(),
      updatedAt: dayjs().utc().toISOString(),
    };

    if (batch) {
      batch.set(ref, safeVal, { merge: true });
    } else {
      await ref.set(safeVal, { merge: true });
    }

    this._logger.info("Match saved to database");
  }

  /**
   * Loads the match from the database
   * @param matchId The id of the match to load
   */
  private async load(matchId: string) {
    const fb = getAdmin();
    const match = await fb.firestore().collection("matches").doc(matchId).get();
    this.match = match.data() as IMatch;

    this._logger.info("Match loaded from database");
  }
}
