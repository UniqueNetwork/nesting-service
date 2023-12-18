import { Injectable, Logger } from '@nestjs/common';
import { RenderImage, RenderTokenInfo } from '../../types';
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
    const image = await Jimp.read(images.shift().url);

    for (const { url } of images) {
      const childImage = await Jimp.read(url);

      image.composite(childImage, 0, 0);
    }

    return image;
  }

  public async render(renderInfo: RenderTokenInfo): Promise<void> {
    this.logger.log('Render token', renderInfo);

    const { images, token } = renderInfo;

    const mergedJimp = await this.mergeImages(images);

    const extension = mergedJimp.getExtension();
    const filename = `${token.chain}/${token.collectionId}/${token.tokenId}.${extension}`;

    const content = await mergedJimp.getBufferAsync(mergedJimp.getMIME());

    this.logger.log('render complete');

    await this.minioService.uploadFile({
      token,
      content,
      filename,
    });
  }
}
