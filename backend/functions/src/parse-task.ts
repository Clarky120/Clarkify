import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { IDemoParseTask } from "@clarkify/types/demo-parse";
import { DemoParseTask } from "@clarkify/core";

exports.onParseTaskCreated = onDocumentCreated(
  { document: "/parse-tasks/{parseTaskId}", region: "europe-west2" },
  async (event) => {
    const taskData = event.data?.data() as IDemoParseTask;
    if (!taskData) return;

    const task = await DemoParseTask.create({ task: taskData });
    await task.run();
  }
);

exports.onParseTaskCreated = onDocumentUpdated(
  { document: "/parse-tasks/{parseTaskId}", region: "europe-west2" },
  async (event) => {
    const taskData = event.data?.after.data() as IDemoParseTask;
    if (!taskData) return;

    if (taskData.status !== "retry") return;

    const task = await DemoParseTask.load({ task: taskData });
    await task.run();
  }
);
