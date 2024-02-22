import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { Address } from '@unique-nft/utils/address';
import { AdminsConfig } from '../../config';
import { CollectionInfo, TokenInfo } from '../../types';
import { SdkService } from '../sdk';

const checkAddressEqual = (left: string) => (right: string) => Address.compare.substrateAddresses(left, right);

@Injectable()
export class ApiAccess {
  @Inject(SdkService)
  private readonly sdk: SdkService;

  private adminsConfig: AdminsConfig;
  constructor(config: ConfigService) {
    this.adminsConfig = config.getOrThrow<AdminsConfig>('admins');
  }

  private async checkCollectionOwner(address: string, collectionInfo: CollectionInfo): Promise<void> {
    const { chain, collectionId } = collectionInfo;

    const owner = await this.sdk.getCollectionOwner({
      chain,
      collectionId,
    });

    const isOwner = Address.compare.substrateAddresses(owner, address);

    if (!isOwner) {
      throw new UnauthorizedException(
        {
          collectionInfo,
        },
        'The collection does not belong to you',
      );
    }
  }

  private async checkTokenOwner(address: string, tokenInfo: TokenInfo): Promise<void> {
    const { chain, collectionId, tokenId } = tokenInfo;

    const owner = await this.sdk.getTokenOwner({
      chain,
      collectionId,
      tokenId,
    });

    const isOwner = Address.compare.substrateAddresses(owner, address);

    if (!isOwner) {
      throw new UnauthorizedException(
        {
          tokenInfo,
        },
        'The token does not belong to you',
      );
    }
  }

  public checkIsAdmin(address: string) {
    if (!this.isAdmin(address)) {
      throw new UnauthorizedException('You are not an admin');
    }
  }

  public isAdmin(address: string) {
    const isEqual = checkAddressEqual(address);

    return this.adminsConfig.adminsAddressList.some(isEqual);
  }

  public async checkCollectionAccess(address: string, collectionInfo: CollectionInfo) {
    if (this.isAdmin(address)) return;

    await this.checkCollectionOwner(address, collectionInfo);
  }

  public async checkTokenAccess(address: string, tokenInfo: TokenInfo) {
    if (this.isAdmin(address)) return;

    await this.checkTokenOwner(address, tokenInfo);
  }
}
