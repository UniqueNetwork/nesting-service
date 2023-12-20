import { Inject, Injectable, Logger } from '@nestjs/common';
import { RenderImage, RenderTokenInfo, RmqPatterns, RmqServiceNames, TokenInfo } from '../../types';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { TokenByIdResponse } from '@unique-nft/sdk';
import { SdkService } from '../sdk';

@Injectable()
export class AnalyzerService {
  private logger = new Logger(AnalyzerService.name);

  constructor(
    private readonly sdkService: SdkService,
    @Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE)
    private rmqClient: ClientProxy,
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

    this.logger.warn(`Couldn't find an image for token ${chain}- ${token.collectionId}/${token.tokenId}!`);
    return null;
  }

  public async buildToken(tokenInfo: TokenInfo): Promise<void> {
    this.logger.log('Building token', tokenInfo);
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
      this.logger.log(`No images to render token: ${chain}/${collectionId}/${tokenId}, ignoring.`);

      return;
    }

    const renderInfo: RenderTokenInfo = {
      token: {
        chain,
        collectionId,
        tokenId,
      },
      images,
      filename: `${chain}/${collectionId}/${tokenId}.png`,
    };

    await lastValueFrom(this.rmqClient.emit(RmqPatterns.RENDER_IMAGES, renderInfo));
  }
}
