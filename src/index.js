require("dotenv").config();
const express = require("express");
const APIExporter = require("./exporters/APIExporter");
const config = require("./config");

const app = express();
const PORT = process.env.PORT || 3500;

setInterval(() => APIExporter.collect(), config.api.collectionTimeout);

app.get("/", async (req, res) => {
  const { source } = req.query;

  if (!source) {
    res.status(404).json({ message: "Source not found." });
    return;
  }

  const metrics = await APIExporter.getMetrics();
  res.end(metrics);
});

app.listen(PORT, () => console.log(`Metrics Server - Running on port ${PORT}`));
