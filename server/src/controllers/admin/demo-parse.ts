import { Request, Response } from "express";
import {
  ICreateTaskRequest,
  ICreateTaskResponse,
} from "@clarkify/types/server-requests/admin/demo-parse";
import { DemoParseTask } from "@clarkify/core/src/demo-parse";
import { logger } from "@clarkify/core";

export const createTask = async (
  req: Request<{}, {}, ICreateTaskRequest>,
  res: Response<ICreateTaskResponse>
) => {
  try {
    const task = new DemoParseTask(req.body.demoId);
    await task.startTask();

    return res.status(200).json({ taskId: task.id });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: "Failed to create task" });
  }
};
