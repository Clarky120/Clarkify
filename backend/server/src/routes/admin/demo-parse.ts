import { app } from "../../server";
import { createTask, retryTask } from "../../controllers/admin/demo-parse";

app.post("/admin/demo-parse/create-task", createTask);
app.post("/admin/demo-parse/retry-task", retryTask);
