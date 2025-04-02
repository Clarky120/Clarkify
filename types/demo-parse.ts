export interface IDemoParseTask {
  id: string;
  matchId: string;
  status: TDemoParseTaskStatus;
  createdAt: string;
  updatedAt: string;
}

export type TDemoParseTaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
