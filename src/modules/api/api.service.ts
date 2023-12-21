import { AuthTokenResponse, GetAuthTokenDto } from './dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { signatureVerify } from '@polkadot/util-crypto';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { CollectionInfo, RmqPatterns, RmqServiceNames, TokenInfo } from '../../types';
import { ApiAccess } from './api.access';
import { ConfigService } from '@nestjs/config';
import { AdminsConfig } from '../../config';
import { SdkService } from '../sdk';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  @Inject(AuthService)
  private readonly authService: AuthService;

  @Inject(ApiAccess)
  private readonly access: ApiAccess;

  @Inject(SdkService)
  private readonly sdk: SdkService;

  constructor(
    private readonly config: ConfigService,
    @Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE)
    private rmqClient: ClientProxy,
  ) {}

  public async getConfiguration(): Promise<any> {
    const admins = this.config.getOrThrow<AdminsConfig>('admins');

    return {
      admins: admins.adminsAddressList,
    };
  }

  public async getAuthToken(body: GetAuthTokenDto): Promise<AuthTokenResponse> {
    const { message, signature, address } = body;

    const { isValid } = signatureVerify(message, signature, address);

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    return {
      access_token: this.authService.sign({
        address,
      }),
    };
  }

  public async buildCollection(address: string, collectionInfo: CollectionInfo): Promise<any> {
    this.logger.log(`Add collection tokens to queue ${JSON.stringify(collectionInfo)}`);

    await this.access.checkCollectionAccess(address, collectionInfo);

    const tokenIds = await this.sdk.getCollectionTokens(collectionInfo);

    const addAllPromises = tokenIds.map((tokenId) =>
      this.addTokenToQueue({
        ...collectionInfo,
        tokenId,
      }),
    );

    await Promise.all(addAllPromises);

    return {
      tokens: tokenIds,
    };
  }

  public async buildToken(address: string, tokenInfo: TokenInfo): Promise<any> {
    this.logger.log(`Add token to queue ${JSON.stringify(tokenInfo)}`);

    await this.access.checkTokenAccess(address, tokenInfo);

    await this.addTokenToQueue(tokenInfo);

    return { ok: true };
  }

  private async addTokenToQueue(tokenInfo: TokenInfo): Promise<void> {
    const sendResult = this.rmqClient.emit<any, TokenInfo>(RmqPatterns.BUILD_TOKEN, {
      ...tokenInfo,
    });

    await lastValueFrom(
      sendResult.pipe(
        catchError((err) => {
          this.logger.error('fail add token to queue', tokenInfo, err);
          return err;
        }),
      ),
    );
  }
}
