// Simple in-memory cache for API responses
interface CacheEntry {
  data: unknown
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

// Cache TTL in milliseconds (2 minutes default)
const DEFAULT_TTL = 2 * 60 * 1000

export function getCached<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > ttl) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

export function setCache(key: string, data: unknown): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

export function clearCache(): void {
  cache.clear()
}

export const getFromCache = getCached
export const setInCache = setCache
