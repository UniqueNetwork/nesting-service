import { Injectable, Logger } from '@nestjs/common';
import { FileForUpload, RenderImage, RenderParentImage, RenderTokenInfo } from '../../types';
import Jimp from 'jimp';
import { MinioService } from '../storage';
import { ImageFetchService } from './image-fetch.service';
import { getLoggerPrefix } from '../utils';
import { rotateImage, scaleImage } from './jimp-utils';

@Injectable()
export class RenderService {
  private logger = new Logger(RenderService.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly imageFetchService: ImageFetchService,
  ) {}

  private async createSampleJimp(image: RenderImage): Promise<Jimp> {
    const buffer = await this.imageFetchService.fetchWithCache(image.url);
    return Jimp.read(buffer);
  }

  private async createBundleJimp(parent: RenderImage, children: RenderImage[]): Promise<Jimp> {
    if (!parent || !children.length) throw new Error('no images to merge');

    const parentJimp = await this.createSampleJimp(parent);

    for (const image of children) {
      const { specs } = image;

      const childJimp = await this.createJimp(image);

      const scaleShift = scaleImage(childJimp, specs);

      rotateImage(parentJimp, childJimp, specs, scaleShift);

      // await drawPoint(jimpImage, specs.anchor.x, specs.anchor.y);
    }

    return parentJimp;
  }

  private async createJimp(image: RenderImage | RenderParentImage): Promise<Jimp> {
    if ('children' in image && image.children.length) {
      return this.createBundleJimp(image, image.children);
    } else {
      return this.createSampleJimp(image);
    }
  }

  public async render(renderInfo: RenderTokenInfo): Promise<void> {
    const { image, tokenInfo } = renderInfo;

    this.logger.log(`${getLoggerPrefix(tokenInfo)} Rendering token`);
    this.logger.debug(`${getLoggerPrefix(tokenInfo)} Image: ${JSON.stringify(image)}`);

    const mergedJimp = await this.createJimp(image);

    const extension = mergedJimp.getExtension();
    const filename = `${tokenInfo.chain}/${tokenInfo.collectionId}/${tokenInfo.tokenId}.${extension}`;

    await mergedJimp.writeAsync('render-images/' + filename);

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
