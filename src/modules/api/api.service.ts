import { AuthTokenResponse, GetAuthTokenDto } from './dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { signatureVerify } from '@polkadot/util-crypto';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { CollectionInfo, RmqPatterns, TokenInfo } from '../../types';
import { ApiAccess } from './api.access';
import { ConfigService } from '@nestjs/config';
import { AdminsConfig } from '../../config';
import { SdkService } from '../sdk';
import { InjectAnalyzerQueue, getLoggerPrefix } from '../utils';

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
    @InjectAnalyzerQueue private analyzerQueue: ClientProxy,
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
    this.logger.log(`${getLoggerPrefix(collectionInfo)} Adding collection tokens to queue`);

    await this.access.checkCollectionAccess(address, collectionInfo);

    const tokenIds = await this.sdk.getCollectionTokens(collectionInfo);

    const addAllPromises = tokenIds
      .sort((a, b) => a - b)
      .map((tokenId) =>
        this.addTokenToQueue({
          ...collectionInfo,
          tokenId,
        }),
      );

    await Promise.all(addAllPromises);

    this.logger.log(`${getLoggerPrefix(collectionInfo)} Added ${tokenIds.length} tokens to queue`);

    return {
      tokens: tokenIds,
    };
  }

  public async buildToken(address: string, tokenInfo: TokenInfo): Promise<any> {
    this.logger.log(`${getLoggerPrefix(tokenInfo)} Adding token to queue`);

    await this.access.checkTokenAccess(address, tokenInfo);

    await this.addTokenToQueue(tokenInfo);

    return { ok: true };
  }

  private async addTokenToQueue(tokenInfo: TokenInfo): Promise<void> {
    const sendResult = this.analyzerQueue.emit<any, TokenInfo>(RmqPatterns.BUILD_TOKEN, {
      ...tokenInfo,
    });

    await lastValueFrom(
      sendResult.pipe(
        catchError((err) => {
          this.logger.error(`${getLoggerPrefix(tokenInfo)} Failed add token to queue: ${err}`);
          return err;
        }),
      ),
    );
  }
}
