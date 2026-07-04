/**
 * Cache Utilities for Product and Data Caching
 * 
 * This module provides utilities for caching product data and other frequently
 * accessed data. Currently uses in-memory caching, but can be extended to use
 * Redis or other caching services.
 */

// In-memory cache (for development)
const cache = new Map<string, { data: any; expires: number }>();

/**
 * Cache durations in seconds
 */
export const CACHE_DURATION = {
  PRODUCTS_LIST: 60, // 1 minute for product listings
  PRODUCT_DETAIL: 600, // 10 minutes for individual products
  FEATURED_PRODUCTS: 300, // 5 minutes for featured products
  CATEGORIES: 3600, // 1 hour for categories list
  SEARCH_RESULTS: 120, // 2 minutes for search results
  USER_DATA: 300, // 5 minutes for user data
} as const;

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}

/**
 * Get data from cache
 */
export function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Set data in cache
 */
export function setInCache(key: string, data: any, durationSeconds: number): void {
  const expires = Date.now() + (durationSeconds * 1000);
  cache.set(key, { data, expires });
}

/**
 * Invalidate cache by prefix
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const [key, value] of cache.entries()) {
    if (now > value.expires) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  }
  
  return {
    total: cache.size,
    valid: validEntries,
    expired: expiredEntries,
  };
}

/**
 * Clean expired entries from cache
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  
  for (const [key, value] of cache.entries()) {
    if (now > value.expires) {
      cache.delete(key);
    }
  }
}

// Auto-clean expired cache every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, 5 * 60 * 1000);
}

/**
 * Wrapper for fetch with caching
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  durationSeconds: number
): Promise<T> {
  // Try to get from cache first
  const cached = getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  setInCache(key, data, durationSeconds);
  
  return data;
}

export default {
  get: getFromCache,
  set: setInCache,
  invalidate: invalidateCacheByPrefix,
  clear: clearAllCache,
  stats: getCacheStats,
  clean: cleanExpiredCache,
  generateKey: generateCacheKey,
  fetchWithCache,
  DURATION: CACHE_DURATION,
};
