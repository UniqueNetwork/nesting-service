import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheEntry {
  value: Buffer;
  expiresAt: number;
  lastAccessed: number;
}

@Injectable()
export class CacheService {
  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly maxItems: number;
  private readonly ttl: number;
  private logger = new Logger(CacheService.name);

  constructor(config: ConfigService) {
    this.ttl = config.getOrThrow<number>('fetch.cacheTTL');
    this.maxItems = config.getOrThrow<number>('fetch.cacheMaxItems');

    setInterval(() => this.cleanup(), this.ttl);
  }

  get(key: string): Buffer | null {
    const entry = this.cache.get(key);
    if (entry) {
      if (entry.expiresAt < Date.now()) {
        this.cache.delete(key);

        this.logger.debug(`Cache miss for ${key} (expired)`);
        return null;
      }

      entry.lastAccessed = Date.now();
      this.logger.debug(`Cache hit for ${key}`);

      return entry.value;
    }

    this.logger.debug(`Cache miss for ${key}`);
    return null;
  }

  set(key: string, value: Buffer): void {
    if (this.cache.size >= this.maxItems) {
      this.evictItems();
    }
    const expiresAt = Date.now() + this.ttl;
    this.cache.set(key, { value, expiresAt, lastAccessed: Date.now() });
    this.logger.debug(`Added ${key} to cache`);
  }

  private cleanup(): void {
    const now = Date.now();
    this.logger.debug(`Cache cleanup started, stats: ${this.getStats()}`);

    this.cache.forEach((value, key) => {
      if (value.expiresAt < now) {
        this.cache.delete(key);

        this.logger.debug(`Evicted ${key} from cache (expired)`);
      }
    });

    this.logger.debug(`Cache cleanup finished. Stats: ${this.getStats()}`);
  }

  private evictItems(): void {
    const sortedEntries = Array.from(this.cache.entries()).sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    const evictedItemsCount = sortedEntries.length - this.maxItems;
    const evictedItems = sortedEntries.slice(0, evictedItemsCount);

    evictedItems.forEach(([key]) => this.cache.delete(key));

    this.logger.debug(`Evicted ${evictedItemsCount} items from cache`);
  }

  private getStats(): string {
    const itemsCount = this.cache.size;
    const cacheEntries = Array.from(this.cache.entries());
    const cacheSize = cacheEntries.reduce((acc, [, { value }]) => acc + value.length, 0);

    return `${itemsCount} items, ${cacheSize} bytes`;
  }
}
