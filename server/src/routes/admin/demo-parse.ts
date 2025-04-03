import { app } from "../../server";
import { createTask } from "../../controllers/admin/demo-parse";

app.post("/admin/demo-parse/create-task", createTask);
