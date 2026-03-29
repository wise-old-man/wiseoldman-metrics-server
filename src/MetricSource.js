class MetricSource {
  slug;
  collector;

  constructor(slug) {
    this.slug = slug;
    this.collector = {};
  }

  /**
   * Each thread would periodically push their metrics into this collector.
   */
  push(threadIndex, plaintextMetrics) {
    this.collector[threadIndex] = {
      timestamp: Date.now(),
      plaintextMetrics
    };

    console.log(this.slug, "pushed", `(thread:${threadIndex})`);
  }

  async getAllMetrics() {
    return Object.values(this.collector)
      .map((entry) => entry.plaintextMetrics ?? "")
      .join("\n\n");
  }
}

module.exports = MetricSource;
