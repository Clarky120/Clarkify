import express from "express";
import adminDemoParse from "./admin/demo-parse";

const router = express.Router();

router.use("/admin/demo-parse", adminDemoParse);

export default router;
