import Redis from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";
import { loggers } from "./logger";

// Use Upstash Redis if available (serverless-friendly), otherwise fallback to ioredis
let redis: Redis | UpstashRedis;
let useUpstash = false;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Use Upstash Redis (serverless-friendly)
  redis = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }) as any;
  useUpstash = true;
  loggers.api.info("Using Upstash Redis for caching");
} else {
  // Fallback to ioredis for local development
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  loggers.api.info("Using ioredis for caching");
}

// Cache configuration
const CACHE_TTL = {
  FILES: 300, // 5 minutes
  MESSAGES: 60, // 1 minute
  USER_DATA: 600, // 10 minutes
  HEALTH_CHECK: 30, // 30 seconds
};

// Cache key generators
const cacheKeys = {
  userFiles: (userId: string) => `user:${userId}:files`,
  file: (fileId: string) => `file:${fileId}`,
  messages: (fileId: string, offset: number, limit: number) =>
    `messages:${fileId}:${offset}:${limit}`,
  user: (userId: string) => `user:${userId}`,
  health: () => "health:check",
};

// Cache interface
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

class RedisCacheService implements CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      let value: string | null;
      if (useUpstash) {
        value = await (redis as UpstashRedis).get<string>(key);
      } else {
        value = await (redis as Redis).get(key);
      }
      if (!value) return null;

      loggers.api.debug({ operation: "cache_get", key });
      return JSON.parse(value);
    } catch (error) {
      loggers.api.error({ operation: "cache_get", key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (useUpstash) {
        if (ttl) {
          await (redis as UpstashRedis).set(key, serialized, { ex: ttl });
        } else {
          await (redis as UpstashRedis).set(key, serialized);
        }
      } else {
        if (ttl) {
          await (redis as Redis).setex(key, ttl, serialized);
        } else {
          await (redis as Redis).set(key, serialized);
        }
      }

      loggers.api.debug({ operation: "cache_set", key, ttl });
    } catch (error) {
      loggers.api.error({ operation: "cache_set", key, error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (useUpstash) {
        await (redis as UpstashRedis).del(key);
      } else {
        await (redis as Redis).del(key);
      }
      loggers.api.debug({ operation: "cache_del", key });
    } catch (error) {
      loggers.api.error({ operation: "cache_del", key, error });
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      let keys: string[];
      if (useUpstash) {
        // Upstash supports keys() method
        keys = await (redis as UpstashRedis).keys(pattern);
      } else {
        keys = await (redis as Redis).keys(pattern);
      }
      if (keys.length > 0) {
        if (useUpstash) {
          await Promise.all(keys.map((k) => (redis as UpstashRedis).del(k)));
        } else {
          await (redis as Redis).del(...keys);
        }
        loggers.api.debug({
          operation: "cache_del_pattern",
          pattern,
          count: keys.length,
        });
      }
    } catch (error) {
      loggers.api.error({ operation: "cache_del_pattern", pattern, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      let result: number;
      if (useUpstash) {
        result = (await (redis as UpstashRedis).exists(key)) ? 1 : 0;
      } else {
        result = await (redis as Redis).exists(key);
      }
      return result === 1;
    } catch (error) {
      loggers.api.error({ operation: "cache_exists", key, error });
      return false;
    }
  }
}

// Fallback in-memory cache for when Redis is not available
class MemoryCacheService implements CacheService {
  private cache = new Map<string, { value: any; expires?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}

// Initialize cache service
let cacheService: CacheService;

async function initializeCache() {
  try {
    if (useUpstash) {
      // Upstash Redis is always available (REST API)
      cacheService = new RedisCacheService();
      loggers.api.info("Upstash Redis cache service initialized");
    } else {
      // Try to connect to Redis
      await (redis as Redis).ping();
      cacheService = new RedisCacheService();
      loggers.api.info("Redis cache service initialized");
    }
  } catch (error) {
    // Fallback to memory cache
    cacheService = new MemoryCacheService();
    loggers.api.warn("Redis not available, using memory cache");
  }
}

// Initialize cache (don't await in module scope to avoid blocking)
initializeCache().catch((error) => {
  loggers.api.error({ error }, "Failed to initialize cache, using memory fallback");
  cacheService = new MemoryCacheService();
});

export { cacheService, cacheKeys, CACHE_TTL };

// Cache decorator for functions
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number,
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);

    // Try to get from cache
    const cached = await cacheService.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    await cacheService.set(key, result, ttl);

    return result;
  };
}

// Cache invalidation helpers
export async function invalidateUserCache(userId: string) {
  await cacheService.delPattern(`user:${userId}:*`);
  loggers.api.info({ operation: "cache_invalidate_user", userId });
}

export async function invalidateFileCache(fileId: string) {
  await cacheService.del(`file:${fileId}`);
  await cacheService.delPattern(`messages:${fileId}:*`);
  loggers.api.info({ operation: "cache_invalidate_file", fileId });
}
