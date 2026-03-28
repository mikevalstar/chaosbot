import express from "express";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const api = express.Router();

api.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

api.get("/hello", (_req, res) => {
  res.json({ message: "Hello from Chaosbot!" });
});

app.use("/api", api);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
