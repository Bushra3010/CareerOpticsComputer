/**
 * In-memory fixed-window rate limiter — the `RATE_LIMIT_PROVIDER=memory`
 * fallback (README "Known limitations"). Per-process only: fine for local
 * dev and a single server instance, not for a multi-instance deployment.
 * Swap for the Upstash-backed provider before that becomes true.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // [FIXED: P0 Map unbounded growth — delete expired bucket before creating new one]
    if (bucket) {
      buckets.delete(key);
    }
    // [FIXED: MEDIUM CWE-400 memory exhaustion — cap total bucket count with FIFO eviction]
    if (buckets.size >= MAX_BUCKETS) {
      const evictCount = Math.floor(MAX_BUCKETS * 0.1);
      let evicted = 0;
      for (const k of buckets.keys()) {
        if (evicted >= evictCount) break;
        buckets.delete(k);
        evicted++;
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
