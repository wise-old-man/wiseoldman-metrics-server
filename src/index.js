require("dotenv").config();
const express = require("express");
const config = require("./config");
const APIExporter = require("./exporters/APIExporter");

const app = express();
const PORT = process.env.PORT || 3500;

setInterval(() => APIExporter.collect(), config.api.collectionTimeout);

app.get("/metrics/api", async (req, res) => {
  const metrics = await APIExporter.getMetrics();
  res.end(metrics);
});

app.get("/metrics/api-v2", async (req, res) => {
  const metrics = await APIV2Exporter.getMetrics();
  res.end(metrics);
});

app.listen(PORT, () => console.log(`Metrics Server - Running on port ${PORT}`));
