import { Injectable, Logger } from '@nestjs/common';
import { FileForUpload, RenderImage, RenderTokenInfo } from '../../types';
import Jimp from 'jimp';
import { ConfigService } from '@nestjs/config';
import { RenderConfig } from '../../config';
import { MinioService } from '../storage';

@Injectable()
export class RenderService {
  private logger = new Logger(RenderService.name);

  private renderConfig: RenderConfig;

  constructor(
    config: ConfigService,
    private readonly minioService: MinioService,
  ) {
    this.renderConfig = config.getOrThrow<RenderConfig>('render');
  }

  private async mergeImages(images: RenderImage[]): Promise<Jimp> {
    if (!images.length) throw new Error('No images to merge');

    const [firstImage, ...restImages] = images;

    const jimpImage = await Jimp.read(firstImage.url);

    for (const { url } of restImages) {
      const childImage = await Jimp.read(url);

      jimpImage.composite(childImage, 0, 0);
    }

    return jimpImage;
  }

  public async render(renderInfo: RenderTokenInfo): Promise<void> {
    const { images, tokenInfo } = renderInfo;
    const { chain, collectionId, tokenId } = tokenInfo;

    this.logger.log(`Rendering token ${chain}/${collectionId}/${tokenId}`);
    this.logger.debug(`Images: ${JSON.stringify(images)}`);

    const mergedJimp = await this.mergeImages(images);

    const extension = mergedJimp.getExtension();
    const filename = `${tokenInfo.chain}/${tokenInfo.collectionId}/${tokenInfo.tokenId}.${extension}`;

    const content = await mergedJimp.getBufferAsync(mergedJimp.getMIME());

    this.logger.log('render complete');

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
