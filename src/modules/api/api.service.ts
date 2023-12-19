import { AuthTokenResponse, GetAuthTokenDto } from './dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { signatureVerify } from '@polkadot/util-crypto';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import {
  CollectionInfo,
  RmqPatterns,
  RmqServiceNames,
  TokenInfo,
} from '../../types';
import { ApiAccess } from './api.access';
import { ConfigService } from '@nestjs/config';
import { AdminsConfig, MinioConfig, RenderConfig } from '../../config';
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

  private readonly minioConfig: MinioConfig;

  constructor(
    private readonly config: ConfigService,
    @Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE)
    private rmqClient: ClientProxy,
  ) {
    this.minioConfig = config.getOrThrow<MinioConfig>('minio');
  }

  public async getConfiguration(): Promise<any> {
    const admins = this.config.getOrThrow<AdminsConfig>('admins');
    const minio = this.config.getOrThrow<MinioConfig>('minio');
    const render = this.config.getOrThrow<RenderConfig>('render');
    return {
      admins: admins.adminsAddressList,
      renderImagesDir: render.imagesDir,
      minioFilenameTemplate: minio.filenameTemplate,
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

  public async buildCollection(
    address: string,
    collectionInfo: CollectionInfo,
  ): Promise<any> {
    this.logger.log(
      `Add collection tokens to queue ${JSON.stringify(collectionInfo)}`,
    );

    await this.access.buildCollectionAccess(address, collectionInfo);

    const tokenIds = await this.sdk.getCollectionTokens(collectionInfo);

    await Promise.all(
      tokenIds.map((tokenId) =>
        this.addTokenToQueue({
          ...collectionInfo,
          tokenId,
        }),
      ),
    );

    return {
      tokens: tokenIds,
    };
  }

  public async buildToken(address: string, tokenInfo: TokenInfo): Promise<any> {
    this.logger.log(`Add token to queue ${JSON.stringify(tokenInfo)}`);

    await this.access.buildTokenAccess(address, tokenInfo);

    const sendResult = this.rmqClient.emit<any, TokenInfo>(
      RmqPatterns.BUILD_TOKEN,
      {
        ...tokenInfo,
      },
    );

    sendResult
      .pipe(
        catchError((err) => {
          this.logger.error('fail add token to queue', tokenInfo, err);
          return err;
        }),
      )
      .subscribe();

    return { ok: true };
  }

  private async addTokenToQueue(tokenInfo: TokenInfo): Promise<void> {
    const sendResult = this.rmqClient.emit<any, TokenInfo>(
      RmqPatterns.BUILD_TOKEN,
      {
        ...tokenInfo,
      },
    );

    await lastValueFrom(
      sendResult.pipe(
        catchError((err) => {
          this.logger.error('fail add token to queue', tokenInfo, err);
          return err;
        }),
      ),
    );
  }

  public getTokenImage(tokenInfo: TokenInfo) {
    const { chain, collectionId, tokenId } = tokenInfo;

    const { endPoint, bucketName, filenameTemplate } = this.minioConfig;
    const filename = filenameTemplate
      .replace('${chain}', chain)
      .replace('${collectionId}', `${collectionId}`)
      .replace('${tokenId}', `${tokenId}`);

    return `https://${endPoint}/${bucketName}/${filename}`;
  }
}
