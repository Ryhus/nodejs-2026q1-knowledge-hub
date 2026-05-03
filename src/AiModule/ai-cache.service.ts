import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

type CacheEntry = {
  value: any;
  expiresAt: number;
};

@Injectable()
export class AiCacheService {
  private cache = new Map<string, CacheEntry>();
  private TTL = Number(process.env.AI_CACHE_TTL_SEC) || 300;

  get(key: string) {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: any, ttlSec = this.TTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSec * 1000,
    });
  }

  buildKey(articleId: string, updatedAt: number, dto: any) {
    return crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          articleId,
          updatedAt,
          dto: this.stableStringify(dto),
        }),
      )
      .digest('hex');
  }

  private stableStringify(value: any): any {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.stableStringify(v));
    }

    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = this.stableStringify(value[key]);
        return acc;
      }, {} as any);
  }
}
