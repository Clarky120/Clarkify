import { Request, Response } from "express";
import {
  ICreateTaskRequest,
  ICreateTaskResponse,
  IRetryTaskRequest,
  IRetryTaskResponse,
} from "@clarkify/types";
import { DemoParseTask } from "@clarkify/core";
import { logger } from "@clarkify/core";

export const createTask = async (
  req: Request<{}, {}, ICreateTaskRequest>,
  res: Response<ICreateTaskResponse>
) => {
  try {
    const task = await DemoParseTask.create({ matchId: req.body.matchId });

    return res.status(200).json({ taskId: task.task.id });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: "Failed to create task", taskId: "" });
  }
};

export const retryTask = async (
  req: Request<{}, {}, IRetryTaskRequest>,
  res: Response<IRetryTaskResponse>
) => {
  try {
    const task = await DemoParseTask.load({ taskId: req.body.taskId });
    task.updateStatus("retry");

    return res.status(200).json({ taskId: task.task.id });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: "Failed to retry task", taskId: "" });
  }
};
