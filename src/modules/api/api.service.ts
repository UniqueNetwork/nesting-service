import { AuthTokenResponse, BuildTokenDto, GetAuthTokenDto } from './dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { signatureVerify } from '@polkadot/util-crypto';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { RmqPatterns, RmqServiceNames, TokenInfo } from '../../types';
import { ApiAccess } from './api.access';
import { ConfigService } from '@nestjs/config';
import { AdminsConfig, MinioConfig, RenderConfig } from '../../config';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  @Inject(AuthService)
  private readonly authService: AuthService;

  @Inject(ApiAccess)
  private readonly access: ApiAccess;

  constructor(
    private readonly config: ConfigService,
    @Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE)
    private rmqClient: ClientProxy,
  ) {}

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

    // todo remove this
    if (signature === 'test') {
      return {
        access_token: this.authService.sign({
          address,
        }),
      };
    }

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

  public async buildToken(address: string, dto: BuildTokenDto): Promise<any> {
    this.logger.log(`Add token to queue ${JSON.stringify(dto)}`);

    await this.access.buildAccess(address, dto);

    const sendResult = this.rmqClient.emit<any, TokenInfo>(
      RmqPatterns.BUILD_TOKEN,
      {
        ...dto,
      },
    );

    sendResult
      .pipe(
        catchError((err) => {
          this.logger.error('fail add token to queue', dto, err);
          return err;
        }),
      )
      .subscribe();

    return { ok: true };
  }
}
