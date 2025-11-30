require("dotenv").config();
const express = require("express");
const MetricSource = require("./MetricSource");

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const PORT = process.env.PORT || 3500;

const apiSource = new MetricSource("Server: API");
const jobRunnerSource = new MetricSource("Server: Job Runner");
const discordBotSource = new MetricSource("Discord Bot");

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

  switch (req.body.source) {
    case "api":
      apiSource.push(threadIndex, req.body.data);
      break;
    case "job-runner":
      jobRunnerSource.push(threadIndex, req.body.data);
      break;
    case "discord-bot":
      discordBotSource.push(threadIndex, req.body.data);
      break;
    default: {
      return res.status(400).json({ message: "invalid source" });
    }
  }

  res.json({});
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

  switch (req.query.source) {
    case "api":
      const apiMetrics = await apiSource.getMetrics(req.query.thread_index ?? 0);
      res.end(apiMetrics);
      break;
    case "job-runner":
      const jobRunnerMetrics = await jobRunnerSource.getMetrics(req.query.thread_index ?? 0);
      res.end(jobRunnerMetrics);
      break;
    case "discord-bot":
      const discordBotMetrics = await discordBotSource.getMetrics(req.query.thread_index ?? 0);
      res.end(discordBotMetrics);
      break;
    default: {
      return res.status(400).json({ message: "invalid source" });
    }
  }
});

app.listen(PORT, () => console.log(`Metrics Server - Running on port ${PORT}`));
