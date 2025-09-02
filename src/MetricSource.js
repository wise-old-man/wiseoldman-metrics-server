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
  push(threadIndex, plaintextMetrics) {
    this.collector[threadIndex] = {
      timestamp: Date.now(),
      plaintextMetrics,
    };

    console.log(this.name, "pushed", `(thread:${threadIndex})`);
  }

  async getMetrics(threadIndex) {
    return this.collector[threadIndex]?.plaintextMetrics ?? "";
  }
}

module.exports = MetricSource;
