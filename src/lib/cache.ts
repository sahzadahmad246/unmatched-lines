// Production-ready caching utility
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, entry);

    // Enforce max size limit
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.config.maxSize
    };
  }
}

// Create different cache instances for different use cases
export const articleCache = new MemoryCache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 1000
});

export const poetCache = new MemoryCache({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 500
});

export const userCache = new MemoryCache({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 200
});

export const searchCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 500
});

// Cache key generators
export const cacheKeys = {
  article: (slug: string) => `article:${slug}`,
  articleList: (page: number, limit: number, filters?: string) => 
    `articles:${page}:${limit}:${filters || 'all'}`,
  poet: (slug: string) => `poet:${slug}`,
  poetWorks: (slug: string, category: string, page: number) => 
    `poet:${slug}:works:${category}:${page}`,
  user: (id: string) => `user:${id}`,
  search: (query: string, page: number) => `search:${query}:${page}`,
  category: (category: string, page: number) => `category:${category}:${page}`,
};

// Cache helper functions
export async function withCache<T>(
  cache: MemoryCache<T>,
  key: string,
  fetcher: () => Promise<T>,
  customTtl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  cache.set(key, data, customTtl);
  
  return data;
}

// Cache invalidation helpers
export function invalidateArticleCache(slug?: string) {
  if (slug) {
    articleCache.delete(cacheKeys.article(slug));
    // Also invalidate related caches
    articleCache.delete(cacheKeys.articleList(1, 20));
  } else {
    articleCache.clear();
  }
}

export function invalidatePoetCache(slug?: string) {
  if (slug) {
    poetCache.delete(cacheKeys.poet(slug));
    // Invalidate poet works cache
    for (let i = 1; i <= 10; i++) {
      poetCache.delete(cacheKeys.poetWorks(slug, 'all', i));
    }
  } else {
    poetCache.clear();
  }
}

export function invalidateUserCache(id?: string) {
  if (id) {
    userCache.delete(cacheKeys.user(id));
  } else {
    userCache.clear();
  }
}

// Cache warming function
export async function warmCache() {
  // This could be called during app startup to pre-populate cache
  // with frequently accessed data
  
  // Example: Pre-load popular articles, poets, etc.
  // Implementation would depend on your specific needs
}
