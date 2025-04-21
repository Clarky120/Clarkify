export interface ICreateTaskRequest {
  matchId: string;
}

export interface ICreateTaskResponse {
  taskId: string;
  error?: string;
}

export interface IRetryTaskRequest {
  taskId: string;
}

export interface IRetryTaskResponse {
  taskId: string;
  error?: string;
}
