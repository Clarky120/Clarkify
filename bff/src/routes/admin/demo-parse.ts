import express from "express";
import { parseDemo } from "../../controllers/admin/demo-parse";

const router = express.Router();

router.post("parse", parseDemo);

export default router;
