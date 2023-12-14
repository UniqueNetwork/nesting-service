import { Inject, Injectable } from '@nestjs/common';
import { AdminsConfig } from '../../config';
import { ConfigService } from '@nestjs/config';
import { TokenInfo } from '../../types';
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

  private async checkOwner(
    address: string,
    tokenInfo: TokenInfo,
  ): Promise<void> {
    const { chain, collectionId, tokenId } = tokenInfo;

    const token = await this.sdk.getTokenOwner({
      chain,
      collectionId,
      tokenId,
    });

    if (address !== token.owner) {
      throw new UnauthorizedException(
        {
          tokenInfo,
        },
        'The token does not belong to you',
      );
    }
  }

  public async buildAccess(address: string, tokenInfo: TokenInfo) {
    if (this.adminsConfig.adminsAddressList.includes(address)) {
      return;
    }

    await this.checkOwner(address, tokenInfo);
  }
}
