import { Injectable, Logger } from '@nestjs/common';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      this.cache.set(key, item);
      this.logger.debug(`Cached item with key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to cache item with key ${key}:`, error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }

      const now = Date.now();
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.logger.debug(`Cache expired for key: ${key}`);
        return null;
      }

      this.logger.debug(`Cache hit for key: ${key}`);
      return item.data;
    } catch (error) {
      this.logger.error(`Failed to retrieve cached item with key ${key}:`, error);
      return null;
    }
  }

  has(key: string): boolean {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return false;
      }

      const now = Date.now();
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to check cache for key ${key}:`, error);
      return false;
    }
  }

  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this.logger.debug(`Deleted cache item with key: ${key}`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete cache item with key ${key}:`, error);
      return false;
    }
  }

  clear(): void {
    try {
      this.cache.clear();
      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
    }
  }

  getStats(): { size: number; keys: string[] } {
    try {
      const keys = Array.from(this.cache.keys());
      return {
        size: this.cache.size,
        keys,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return { size: 0, keys: [] };
    }
  }

  cleanup(): void {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => this.cache.delete(key));
      
      if (expiredKeys.length > 0) {
        this.logger.debug(`Cleaned up ${expiredKeys.length} expired cache items`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup cache:', error);
    }
  }
}
