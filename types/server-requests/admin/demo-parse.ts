export interface ICreateTaskRequest {
  matchId: string;
}

export interface ICreateTaskResponse {
  taskId: string;
  error?: string;
}
