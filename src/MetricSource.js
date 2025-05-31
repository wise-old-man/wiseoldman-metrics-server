const prometheus = require("prom-client");

class MetricSource {
  name;
  collector;

  constructor(name) {
    this.name = name;
    this.collector = {};
  }

  /**
   * Each thread would periodically push their metrics into this collector.
   */
  push(threadIndex, metrics) {
    this.collector[threadIndex] = {
      timestamp: Date.now(),
      metrics,
    };

    console.log(this.name, "pushed", `(thread:${threadIndex})`);
  }

  /**
   * Aggregate the metrics collected from all pm2 threads.
   */
  async getMetrics() {
    const dataSets = Object.values(this.collector).map((d) => d.metrics);
    const registry = prometheus.AggregatorRegistry.aggregate(dataSets);
    const metrics = await registry.metrics();

    return metrics;
  }
}

module.exports = MetricSource;
