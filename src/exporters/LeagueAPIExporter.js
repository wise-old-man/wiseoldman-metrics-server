const axios = require("axios");
const prometheus = require("prom-client");
const config = require("../config.json");

class LeagueAPIExporter {
  collector;
  lastExport;

  constructor() {
    this.collector = {};
    this.lastExport = 0;
  }

  #hasOutdatedEntries() {
    const entries = Object.values(this.collector);
    return entries.length < process.env.CPU_COUNT || entries.some((e) => e.timestamp < this.lastExport);
  }

  /**
   * Sends one API request per pm2 cluster thread, to try and collect
   * the latest metrics from each pm2 instance.
   */
  collect() {
    // If the CPU Count isn't configured in the master environment file
    if (!process.env.CPU_COUNT) return;

    // If has collected updated data from all threads since the last
    // export date, then we can skip any collection attempts until the next export
    if (!this.#hasOutdatedEntries()) return;

    for (let i = 0; i < process.env.CPU_COUNT; i++) {
      axios
        .get(config.leagueApi.metricsEndpoint)
        .then((result) => {
          const { threadIndex, data } = result.data;

          this.collector[threadIndex] = {
            timestamp: Date.now(),
            metrics: data,
          };
        })
        .catch((e) => {
          console.log("Failed to load API metrics.");
        });
    }
  }

  /**
   * Aggregate the metrics collected from all pm2 threads.
   */
  async getMetrics() {
    const dataSets = Object.values(this.collector).map((d) => d.metrics);
    const registry = prometheus.AggregatorRegistry.aggregate(dataSets);
    const metrics = await registry.metrics();

    this.lastExport = Date.now();

    return metrics;
  }
}

module.exports = new LeagueAPIExporter();
