import express from "express";
import { logger } from "./lib/logger.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      { method: req.method, url: req.originalUrl, status: res.statusCode, ms: Date.now() - start },
      `${req.method} ${req.originalUrl} ${res.statusCode}`,
    );
  });
  next();
});

const api = express.Router();

api.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

api.get("/hello", (_req, res) => {
  res.json({ message: "Hello from Chaosbot!" });
});

app.use("/api", api);

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
