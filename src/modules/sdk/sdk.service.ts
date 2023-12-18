import { Injectable } from '@nestjs/common';
import {
  CollectionData,
  GetBundleResponse,
  Room,
  TokenByIdResponse,
} from '@unique-nft/sdk';
import {
  ChainType,
  CollectionInfo,
  SubscribeCallback,
  TokenInfo,
} from '../../types';
import { ConfigService } from '@nestjs/config';
import { SdkConfig } from '../../config';
import { Sdk, SubscriptionEvents } from '@unique-nft/sdk/full';

@Injectable()
export class SdkService {
  private sdkByChain: Record<ChainType, Sdk>;
  constructor(config: ConfigService) {
    const { opalUrl, quartzUrl, uniqueUrl } =
      config.getOrThrow<SdkConfig>('sdk');

    this.sdkByChain = {
      [ChainType.OPAL]: new Sdk({ baseUrl: opalUrl }),
      [ChainType.QUARTZ]: new Sdk({ baseUrl: quartzUrl }),
      [ChainType.UNIQUE]: new Sdk({ baseUrl: uniqueUrl }),
    };
  }

  public subscribe(callback: SubscribeCallback) {
    Object.entries(this.sdkByChain).forEach(([chain, sdk]) => {
      sdk.subscription
        .connect()
        .subscribeCollection()
        .on(
          SubscriptionEvents.COLLECTIONS,
          (root: Room, eventData: CollectionData) =>
            callback(chain as ChainType, eventData),
        );
    });
  }

  public async getToken(tokenInfo: TokenInfo): Promise<TokenByIdResponse> {
    const { chain, collectionId, tokenId } = tokenInfo;

    return this.sdkByChain[chain].token.get({ collectionId, tokenId });
  }

  public async getBundle(tokenInfo: TokenInfo): Promise<GetBundleResponse> {
    const { chain, collectionId, tokenId } = tokenInfo;

    return this.sdkByChain[chain].token.getBundle({ collectionId, tokenId });
  }

  public async getCollectionOwner(
    collectionInfo: CollectionInfo,
  ): Promise<string> {
    const { chain, collectionId } = collectionInfo;

    const { owner } = await this.sdkByChain[chain].collection.get({
      collectionId,
    });

    return owner;
  }

  public async getTokenOwner(tokenInfo: TokenInfo): Promise<string> {
    const { chain, collectionId, tokenId } = tokenInfo;

    const { owner } = await this.sdkByChain[chain].token.owner({
      collectionId,
      tokenId,
    });

    return owner;
  }

  public async getCollectionTokens(
    collectionInfo: CollectionInfo,
  ): Promise<number[]> {
    const { chain, collectionId } = collectionInfo;

    const { ids } = await this.sdkByChain[chain].collection.tokens({
      collectionId,
    });

    return ids;
  }
}
