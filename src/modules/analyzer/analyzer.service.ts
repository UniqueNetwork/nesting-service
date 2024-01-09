import { Injectable, Logger } from '@nestjs/common';
import { RenderImage, RenderTokenInfo, RmqPatterns, TokenInfo } from '../../types';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { SdkService } from '../sdk';
import { InjectRenderQueue, getLoggerPrefix } from '../utils';

@Injectable()
export class AnalyzerService {
  private logger = new Logger(AnalyzerService.name);

  constructor(
    private readonly sdkService: SdkService,
    @InjectRenderQueue private renderQueue: ClientProxy,
  ) {}

  private getTokenImageLayer(
    chain: string,
    token: TokenByIdResponse,
    searchImageOutsideOfSchema: boolean,
  ): RenderImage | null {
    if (token.file && token.file.fullUrl) {
      return {
        url: token.file.fullUrl,
      };
    }

    if (token.image.fullUrl) {
      return {
        url: token.image.fullUrl,
      };
    }

    if (searchImageOutsideOfSchema) {
      for (const prop of token.properties) {
        if (prop.key == 'i.u') {
          return {
            url: prop.value,
          };
        }
      }
    }

    this.logger.warn(`${getLoggerPrefix({ ...token, chain })} Couldn't find an image for token!`);
    return null;
  }

  public async buildToken(tokenInfo: TokenInfo): Promise<void> {
    this.logger.log(`${getLoggerPrefix(tokenInfo)} Going to build token`);
    const { chain, collectionId, tokenId } = tokenInfo;

    const [bundle, token] = await Promise.all([
      this.sdkService.getBundle({ chain, collectionId, tokenId }),
      this.sdkService.getToken({ chain, collectionId, tokenId }),
    ]);

    const nestedTokensPromises = bundle.nestingChildTokens.map((nested) =>
      this.sdkService.getToken({
        chain,
        collectionId: nested.collectionId,
        tokenId: nested.tokenId,
      }),
    );

    const nestedTokens = await Promise.all(nestedTokensPromises);

    const tokens = [token, ...nestedTokens];

    const images: RenderImage[] = tokens
      .map((token) => this.getTokenImageLayer(chain, token, true))
      .filter((image): image is RenderImage => !!image);

    if (!images.length) {
      this.logger.log(`${getLoggerPrefix(tokenInfo)} No images for token, ignoring.`);

      return;
    }

    const renderInfo: RenderTokenInfo = {
      tokenInfo,
      images,
    };

    await lastValueFrom(this.renderQueue.emit(RmqPatterns.RENDER_IMAGES, renderInfo));

    this.logger.log(`${getLoggerPrefix(tokenInfo)} Token build complete, images sent to render queue`);
  }
}
