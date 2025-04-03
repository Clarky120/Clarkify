import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { IDemoParseTask } from "@clarkify/types/demo-parse";
import { DemoParseTask } from "@clarkify/core";

exports.onParseTaskCreated = onDocumentCreated(
  { document: "/parse-tasks/{parseTaskId}", region: "europe-west2" },
  async (event) => {
    const taskData = event.data?.data() as IDemoParseTask;
    if (!taskData) return;

    const task = await DemoParseTask.create({ task: taskData });

    await task.parseData();
  }
);
