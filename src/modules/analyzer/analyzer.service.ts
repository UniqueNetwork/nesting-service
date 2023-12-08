import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  RenderImage,
  RenderTokenInfo,
  RmqPatterns,
  RmqServiceNames,
  Token,
} from '../../types';
import { Sdk } from '@unique-nft/sdk/full';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { TokenByIdResponse } from '@unique-nft/sdk';

@Injectable()
export class AnalyzerService {
  private logger = new Logger(AnalyzerService.name);

  constructor(
    private readonly sdk: Sdk,
    @Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE)
    private rmqClient: ClientProxy,
  ) {}

  private getTokenImageLayer(
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

    this.logger.warn(
      `Couldn't find an image for token ${token.collectionId}/${token.tokenId}!`,
    );
    return null;
  }

  public async buildToken(tokenInfo: Token): Promise<void> {
    this.logger.log('Build token', tokenInfo);
    const [bundle, token] = await Promise.all([
      this.sdk.token.getBundle(tokenInfo),
      this.sdk.token.get(tokenInfo),
    ]);

    if (!bundle.nestingChildTokens.length) {
      return;
    }

    const nestedTokens = await Promise.all(
      bundle.nestingChildTokens.map((nested) => this.sdk.token.get(nested)),
    );

    const images: RenderImage[] = [
      this.getTokenImageLayer(token, true),
      ...nestedTokens.map((nestedToken) =>
        this.getTokenImageLayer(nestedToken, true),
      ),
    ].filter((image) => !!image);

    if (!images.length) {
      this.logger.log(
        `No images to render token: ${tokenInfo.collectionId}/${tokenInfo.tokenId}!`,
      );
      return;
    }

    const renderInfo: RenderTokenInfo = {
      token: tokenInfo,
      images,
      filename: `${tokenInfo.collectionId}-${tokenInfo.tokenId}.png`,
    };

    await lastValueFrom(
      this.rmqClient.emit(RmqPatterns.RENDER_IMAGES, renderInfo),
    );
  }
}
