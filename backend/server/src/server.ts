import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
// import apiRoutes from "./routes";
import { logger } from "@clarkify/core";
import { loadFirebase } from "@clarkify/core";

// Load environment variables
dotenv.config();

// Set default meta for logger
logger.defaultMeta = {
  service: "server",
};

// Connect to Firebase
loadFirebase();

// Create Express server
export const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
// app.use("/", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export * from "./routes/admin/demo-parse";
