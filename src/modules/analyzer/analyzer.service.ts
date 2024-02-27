import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RenderImage, RenderTokenInfo, JobName, TokenInfo, RenderParentImage, RenderImageSpecs } from '../../types';
import { SdkService } from '../sdk';
import { getLoggerPrefix, getJobId, InjectRenderQueue } from '../utils';
import { Queue } from 'bullmq';
import { IV2Token, IV2CustomizingImageOverlaySpecs } from '@unique-nft/schemas';
import merge from 'lodash.merge';
import { orderValue } from './utils';

@Injectable()
export class AnalyzerService implements OnApplicationBootstrap {
  private logger = new Logger(AnalyzerService.name);

  constructor(
    private readonly sdkService: SdkService,
    @InjectRenderQueue private readonly renderQueue: Queue,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.buildToken({ chain: 'opal', collectionId: 2444, tokenId: 6 });
  }

  private getImageSpecs(specs: IV2CustomizingImageOverlaySpecs | undefined): RenderImageSpecs {
    const specsSafe = specs || {};

    return {
      order: [specsSafe.layer || 0, specsSafe.order_in_layer || 0],
      offset: {
        x: specsSafe.offset?.x || 0,
        y: specsSafe.offset?.y || 0,
      },
      scale: {
        x: specsSafe.scale?.x || 0,
        y: specsSafe.scale?.y || 0,
      },
      opacity: specsSafe.opacity || 100,
      rotation: specsSafe.rotation || 0,
      anchor: {
        x: specsSafe.mount_point?.x || 0,
        y: specsSafe.mount_point?.y || 0,
      },
    };
  }

  private getImage(schema: IV2Token, parent?: RenderImage): RenderImage | null {
    console.log(`
****** token schema begin ******
${JSON.stringify(schema, null, 2)}
******* token schema end *******`);
    if (!schema.customizing) {
      return null;
    }
    const { customizing } = schema;

    if (customizing.self?.type !== 'image' || !customizing.self?.url) {
      return null;
    }

    const specs = this.getImageSpecs(customizing?.self.image_overlay_specs);
    const fullSpecs = parent ? merge({}, parent.specs, specs) : specs;
    // const fullSpecs = parent ? specs : specs;

    return {
      url: customizing.self.url,
      specs: fullSpecs,
    };
  }

  private getParentImage(parentSchema: IV2Token, childrenSchemas: IV2Token[]): RenderParentImage | null {
    const parentImage = this.getImage(parentSchema);
    if (!parentImage || !parentSchema.customizing?.slots) {
      return null;
    }

    const children: RenderImage[] = childrenSchemas
      .filter(
        (schema) =>
          parentSchema.customizing?.slots &&
          schema.customizing?.self?.tag &&
          schema.customizing?.self?.tag in parentSchema.customizing?.slots,
      )
      .map((schema) => this.getImage(schema, parentImage))
      .filter((renderImage) => !!renderImage)
      .sort((i1, i2) => {
        const v1 = orderValue(i1?.specs.order || []);
        const v2 = orderValue(i2?.specs.order || []);
        return v2 - v1;
      }) as RenderImage[];

    return {
      ...parentImage,
      children,
    };
  }

  public async buildToken(tokenInfo: TokenInfo): Promise<void> {
    this.logger.log(`${getLoggerPrefix(tokenInfo)} Going to build token`);
    const { chain, collectionId, tokenId, priority } = tokenInfo;

    const [bundle, schema] = await Promise.all([
      this.sdkService.getBundle({ chain, collectionId, tokenId }),
      this.sdkService.getTokenSchemaV2(chain, collectionId, tokenId),
    ]);

    if (!schema) {
      this.logger.log(`${getLoggerPrefix(tokenInfo)} No found token.`);
      return;
    }

    const nestedTokens = (
      await Promise.all(
        bundle.nestingChildTokens.map((nested) =>
          this.sdkService.getTokenSchemaV2(chain, nested.collectionId, nested.tokenId),
        ),
      )
    ).filter((token) => !!token) as IV2Token[];

    const image = this.getParentImage(schema, nestedTokens);

    if (!image || !image.children.length) {
      this.logger.log(`${getLoggerPrefix(tokenInfo)} No images for token, ignoring.`);

      return;
    }

    console.log(`
****** image begin ******
${JSON.stringify(image, null, 2)}
****** image end *******\`);`);

    const renderInfo: RenderTokenInfo = {
      tokenInfo,
      image,
    };

    await this.renderQueue.add(JobName.RENDER_IMAGES, renderInfo, { jobId: getJobId(tokenInfo), priority });

    this.logger.log(`${getLoggerPrefix(tokenInfo)} Token build complete, images sent to render queue`);
  }
}
