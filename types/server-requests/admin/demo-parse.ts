export interface ICreateTaskRequest {
  demoId: string;
}

export interface ICreateTaskResponse {
  taskId?: string;
  error?: string;
}
