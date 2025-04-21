export interface IDemoParseTask {
  id: string;
  matchId: string;
  status: TDemoParseTaskStatus;
  createdAt: string;
  updatedAt: string;
  error?: any;
}

export type TDemoParseTaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "retry";
