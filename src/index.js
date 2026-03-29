require("dotenv").config();
const express = require("express");
const MetricSource = require("./MetricSource");

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const PORT = process.env.PORT || 3500;

const SOURCES = [
  new MetricSource("api"),
  new MetricSource("job-runner"),
  new MetricSource("discord-bot"),

  // Temporary league
  new MetricSource("league-api"),
  new MetricSource("league-job-runner")
];

// Sources push their (plaintext) metrics to this route
app.post("/metrics", async (req, res) => {
  console.log(`POST /metrics`, `(source=${req.body.source})`, `(thread_index=${req.body.thread_index})`);

  if (!req.body.source) {
    console.error("Undefined source");
    return res.status(400).json({ message: "undefined source" });
  }

  if (!req.body.data) {
    console.error("Undefined data payload");
    return res.status(400).json({ message: "undefined data payload" });
  }

  const threadIndex = req.body.thread_index ?? 0;

  const source = SOURCES.find((s) => s.slug === req.body.source);

  if (source === undefined) {
    console.error("Invalid source", req.body.source);
    res.status(400).json({ message: "invalid source" });
    return;
  }

  source.push(threadIndex, req.body.data);
  res.json({});
});

app.get("/scrape", async (req, res) => {
  const content = [];

  for (const source of SOURCES) {
    const metrics = await source.getAllMetrics();
    content.push(metrics);
  }

  res.end(content.join("\n\n"));
});

app.listen(PORT, () => console.log(`Metrics Server - Running on port ${PORT}`));
