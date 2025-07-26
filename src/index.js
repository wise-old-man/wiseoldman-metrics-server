require("dotenv").config();
const express = require("express");
const MetricSource = require("./MetricSource");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const PORT = process.env.PORT || 3500;

const apiSource = new MetricSource("API");
const discordBotSource = new MetricSource("Discord Bot");

// Sources push their metrics to this route
app.post("/metrics", async (req, res) => {
  if (!req.body.source) {
    return res.status(400).json({ message: "undefined source" });
  }

  if (!req.body.data) {
    return res.status(400).json({ message: "undefined data payload" });
  }

  const threadIndex = req.body.threadIndex ?? 0;

  switch (req.body.source) {
    case "api":
      apiSource.push(threadIndex, req.body.data);
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
  if (!req.query.source) {
    return res.status(400).json({ message: "undefined source" });
  }

  switch (req.query.source) {
    case "api":
      const apiMetrics = await apiSource.getMetrics();
      res.end(apiMetrics);
      break;
    case "discord-bot":
      const discordBotMetrics = await discordBotSource.getMetrics();
      res.end(discordBotMetrics);
      break;
    default: {
      return res.status(400).json({ message: "invalid source" });
    }
  }
});

app.listen(PORT, () => console.log(`Metrics Server - Running on port ${PORT}`));
