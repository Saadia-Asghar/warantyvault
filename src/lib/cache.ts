/** Short TTL cache for read-heavy public APIs (per server instance). */
const store = new Map<string, { value: unknown; expires: number }>();

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs = 60_000) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  if (store.size > 500) {
    const now = Date.now();
    store.forEach((v, k) => {
      if (v.expires < now) store.delete(k);
    });
  }
}
