import { Injectable, Logger } from '@nestjs/common';
import { HttpDownloadService } from './http.download.service';
import { HeliaDownloadService } from './helia.download.service';
import { tryParseIpfsGatewayUrl } from './helia-utils';

@Injectable()
export class DownloadService {
  logger = new Logger(DownloadService.name);

  constructor(
    private readonly httpDownloadService: HttpDownloadService,
    private readonly heliaDownloadService: HeliaDownloadService,
  ) {}

  public async fetch(url: string): Promise<Buffer> {
    const parsedIpfsUrl = await tryParseIpfsGatewayUrl(url);

    if (parsedIpfsUrl) {
      this.logger.debug(`Fetching ${url} via Helia`);
      return this.heliaDownloadService.fetch(url);
    }

    this.logger.debug(`Fetching ${url} via HTTP`);
    return this.httpDownloadService.fetch(url);
  }
}
