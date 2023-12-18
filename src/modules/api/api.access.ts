import { Inject, Injectable } from '@nestjs/common';
import { AdminsConfig } from '../../config';
import { ConfigService } from '@nestjs/config';
import { CollectionInfo, TokenInfo } from '../../types';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { SdkService } from '../sdk';

@Injectable()
export class ApiAccess {
  @Inject(SdkService)
  private readonly sdk: SdkService;

  private adminsConfig: AdminsConfig;
  constructor(config: ConfigService) {
    this.adminsConfig = config.getOrThrow<AdminsConfig>('admins');
  }

  private async checkCollectionOwner(
    address: string,
    collectionInfo: CollectionInfo,
  ): Promise<void> {
    const { chain, collectionId } = collectionInfo;

    const owner = await this.sdk.getCollectionOwner({
      chain,
      collectionId,
    });

    if (address !== owner) {
      throw new UnauthorizedException(
        {
          collectionInfo,
        },
        'The collection does not belong to you',
      );
    }
  }

  private async checkTokenOwner(
    address: string,
    tokenInfo: TokenInfo,
  ): Promise<void> {
    const { chain, collectionId, tokenId } = tokenInfo;

    const owner = await this.sdk.getTokenOwner({
      chain,
      collectionId,
      tokenId,
    });

    if (address !== owner) {
      throw new UnauthorizedException(
        {
          tokenInfo,
        },
        'The token does not belong to you',
      );
    }
  }

  public async buildCollectionAccess(
    address: string,
    collectionInfo: CollectionInfo,
  ) {
    if (this.adminsConfig.adminsAddressList.includes(address)) {
      return;
    }

    await this.checkCollectionOwner(address, collectionInfo);
  }

  public async buildTokenAccess(address: string, tokenInfo: TokenInfo) {
    if (this.adminsConfig.adminsAddressList.includes(address)) {
      return;
    }

    await this.checkTokenOwner(address, tokenInfo);
  }
}
