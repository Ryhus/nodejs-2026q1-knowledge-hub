import { Injectable } from '@nestjs/common';

@Injectable()
export class AiObservabilityService {
  private metrics = {
    total: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalLatencyMs: 0,
  };

  startTimer() {
    return performance.now();
  }

  endTimer(start: number) {
    return performance.now() - start;
  }

  recordRequest(latency: number) {
    this.metrics.total++;
    this.metrics.totalLatencyMs += latency;
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  getStats() {
    return {
      ...this.metrics,
      avgLatency:
        this.metrics.total === 0
          ? 0
          : this.metrics.totalLatencyMs / this.metrics.total,
      cacheHitRatio:
        this.metrics.total === 0
          ? 0
          : this.metrics.cacheHits / this.metrics.total,
    };
  }
}
