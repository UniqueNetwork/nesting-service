import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HttpDownloadService {
  readonly timeout: number;

  readonly logger = new Logger(HttpDownloadService.name);

  constructor(
    private readonly http: HttpService,
    private readonly cacheService: CacheService,
    config: ConfigService,
  ) {
    this.http = http;
    this.timeout = config.getOrThrow<number>('fetch.timeout');
  }

  public async fetchWithCache(url: string): Promise<Buffer> {
    try {
      const cached = this.cacheService.get(url);
      if (cached) return cached;

      const fetched = await this.fetch(url);
      this.cacheService.set(url, fetched);

      return fetched;
    } catch (error) {
      this.logger.error(`Failed to fetch ${url}: ${error.message}`);

      throw error;
    }
  }

  public async fetch(url: string): Promise<Buffer> {
    const signal = AbortSignal.timeout(this.timeout);
    const $response = this.http.get<ArrayBuffer>(url, { responseType: 'arraybuffer', signal });
    const response = await lastValueFrom($response);

    return Buffer.from(response.data);
  }
}
