require("dotenv").config();
const express = require("express");
const config = require("./config");
const APIExporter = require("./exporters/APIExporter");
const APIV2Exporter = require("./exporters/APIV2Exporter");

const app = express();
const PORT = process.env.PORT || 3500;

setInterval(() => APIExporter.collect(), config.api.collectionTimeout);
setInterval(() => APIV2Exporter.collect(), config["api-v2"].collectionTimeout);

app.get("/metrics/api", async (req, res) => {
  const metrics = await APIExporter.getMetrics();
  res.end(metrics);
});

app.get("/metrics/api-v2", async (req, res) => {
  const metrics = await APIV2Exporter.getMetrics();
  res.end(metrics);
});

app.listen(PORT, () => console.log(`Metrics Server - Running on port ${PORT}`));
