import { Inject, Injectable, Logger, Provider } from '@nestjs/common';
import { getHeliaLib, getHeliaUnixfsLib, tryParseIpfsGatewayUrl } from './helia-utils';

import type { HeliaUnixfsLib, ParsedIpfsUrl } from './helia-utils';
import type { Helia } from 'helia';

const HELIA = Symbol('HELIA');
const HELIA_UNIXFS = Symbol('HELIA_UNIXFS');

export const heliaProvider: Provider = {
  provide: HELIA,
  useFactory: async () => {
    const lib = await getHeliaLib();

    return lib.createHelia();
  },
};

export const heliaUnixfsProvider: Provider = {
  provide: HELIA_UNIXFS,
  inject: [HELIA],
  useFactory: async (helia: Helia) => {
    const lib = await getHeliaUnixfsLib();

    return lib.unixfs(helia);
  },
};

@Injectable()
export class HeliaDownloadService {
  logger = new Logger(HeliaDownloadService.name);

  constructor(
    @Inject(HELIA) private readonly helia: Helia,
    @Inject(HELIA_UNIXFS) private readonly unixfs: HeliaUnixfsLib.UnixFS,
  ) {}

  // todo - also check max size ?
  private async checkFile(parsedIpfsUrl: ParsedIpfsUrl): Promise<void> {
    const { cid, path } = parsedIpfsUrl;
    const stat = await this.unixfs.stat(cid, { path });

    if (stat.type !== 'file') {
      const message = `Not a file: ${parsedIpfsUrl.cid}/${parsedIpfsUrl.path}`;

      this.logger.error(message);

      throw new Error(message);
    }
  }

  private async fetchBuffer(parsedIpfsUrl: ParsedIpfsUrl): Promise<Buffer> {
    const { cid, path } = parsedIpfsUrl;

    const chunks: Array<Uint8Array> = [];

    for await (const chunk of this.unixfs.cat(cid, { path })) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async fetch(url: string | ParsedIpfsUrl): Promise<Buffer> {
    const parsedUrl = typeof url === 'string' ? await tryParseIpfsGatewayUrl(url) : url;

    if (!parsedUrl) throw new Error(`Failed to parse url: ${url}`);

    await this.checkFile(parsedUrl);

    return await this.fetchBuffer(parsedUrl);
  }
}
