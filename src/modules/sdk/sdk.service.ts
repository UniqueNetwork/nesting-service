import { Injectable } from '@nestjs/common';
import { GetBundleResponse, TokenByIdResponse } from '@unique-nft/sdk';
import { ChainType, TokenInfo } from '../../types';
import { ConfigService } from '@nestjs/config';
import { SdkConfig } from '../../config';
import { Sdk } from '@unique-nft/sdk/full';

@Injectable()
export class SdkService {
  private sdkByChain: Record<ChainType, Sdk>;
  constructor(config: ConfigService) {
    const sdkConfig = config.getOrThrow<SdkConfig>('sdk');
    this.sdkByChain = {
      [ChainType.OPAL]: new Sdk({ baseUrl: sdkConfig.opalUrl }),
      [ChainType.QUARTZ]: new Sdk({ baseUrl: sdkConfig.quartzUrl }),
      [ChainType.UNIQUE]: new Sdk({ baseUrl: sdkConfig.uniqueUrl }),
    };
  }

  public async getToken(tokenInfo: TokenInfo): Promise<TokenByIdResponse> {
    const { chain, collectionId, tokenId } = tokenInfo;

    return this.sdkByChain[chain].token.get({ collectionId, tokenId });
  }

  public async getBundle(tokenInfo: TokenInfo): Promise<GetBundleResponse> {
    const { chain, collectionId, tokenId } = tokenInfo;

    return this.sdkByChain[chain].token.getBundle({ collectionId, tokenId });
  }
}
