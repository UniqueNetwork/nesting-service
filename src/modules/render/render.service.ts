import { Injectable, Logger } from '@nestjs/common';
import { FileForUpload, RenderImage, RenderTokenInfo } from '../../types';
import Jimp from 'jimp';
import { ConfigService } from '@nestjs/config';
import { RenderConfig } from '../../config';
import { MinioService } from '../storage';
import { ImageFetchService } from './image-fetch.service';
import { getLoggerPrefix } from '../utils';

@Injectable()
export class RenderService {
  private logger = new Logger(RenderService.name);

  private renderConfig: RenderConfig;

  constructor(
    config: ConfigService,
    private readonly minioService: MinioService,
    private readonly imageFetchService: ImageFetchService,
  ) {
    this.renderConfig = config.getOrThrow<RenderConfig>('render');
  }

  private async mergeImages(images: RenderImage[]): Promise<Jimp> {
    if (!images.length) throw new Error('no images to merge');

    const [firstImage, ...restImages] = images;

    const imageBuffer = await this.imageFetchService.fetchWithCache(firstImage.url);
    const jimpImage = await Jimp.read(imageBuffer);

    for (const { url } of restImages) {
      const childImageBuffer = await this.imageFetchService.fetchWithCache(url);
      const childImage = await Jimp.read(childImageBuffer);

      jimpImage.composite(childImage, 0, 0);
    }

    return jimpImage;
  }

  public async render(renderInfo: RenderTokenInfo): Promise<void> {
    const { images, tokenInfo } = renderInfo;

    this.logger.log(`${getLoggerPrefix(tokenInfo)} Rendering token`);
    this.logger.debug(`${getLoggerPrefix(tokenInfo)} Images: ${JSON.stringify(images)}`);

    const mergedJimp = await this.mergeImages(images);

    const extension = mergedJimp.getExtension();
    const filename = `${tokenInfo.chain}/${tokenInfo.collectionId}/${tokenInfo.tokenId}.${extension}`;

    const content = await mergedJimp.getBufferAsync(mergedJimp.getMIME());

    this.logger.log(`${getLoggerPrefix(tokenInfo)} Rendering complete`);

    const fileForUpload: FileForUpload = {
      tokenInfo,
      content,
      filename,
      metadata: {
        'content-type': mergedJimp.getMIME(),
        timestamp: Date.now().toString(),
      },
    };

    await this.minioService.upload(fileForUpload);
  }
}
