require("dotenv").config();
const express = require("express");
const MetricSource = require("./MetricSource");

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const PORT = process.env.PORT || 3500;

const SOURCES = {
  api: new MetricSource("Server: API"),
  "job-runner": new MetricSource("Server: Job Runner"),
  "discord-bot": new MetricSource("Discord Bot")
};

// Sources push their (plaintext) metrics to this route
app.post("/metrics", async (req, res) => {
  console.log(`POST /metrics`, `(source=${req.body.source})`, `(thread_index=${req.body.thread_index})`);

  if (!req.body.source) {
    return res.status(400).json({ message: "undefined source" });
  }

  if (!req.body.data) {
    return res.status(400).json({ message: "undefined data payload" });
  }

  const threadIndex = req.body.thread_index ?? 0;

  const source = SOURCES[req.body.source];

  if (source === undefined) {
    res.status(400).json({ message: "invalid source" });
    return;
  }

  source.push(threadIndex, req.body.data);
  res.json({});
});

app.get("/scrape", async (req, res) => {
  const content = [];

  for (const values of Object.values(SOURCES)) {
    const metrics = await values.getAllMetrics();
    content.push(metrics);
  }

  res.end(content.join("\n\n"));
});

// Prometheus fetches metrics from this route
app.get("/metrics", async (req, res) => {
  console.log(
    `GET /metrics`,
    `(source=${req.query.source})`,
    `(thread_index=${req.query.thread_index})`
  );

  if (!req.query.source) {
    return res.status(400).json({ message: "undefined source" });
  }

  const source = SOURCES[req.query.source];

  if (source === undefined) {
    res.status(400).json({ message: "invalid source" });
    return;
  }

  const metrics = await source.getMetrics(req.query.thread_index ?? 0);
  res.end(metrics);
});

app.listen(PORT, () => console.log(`Metrics Server - Running on port ${PORT}`));
