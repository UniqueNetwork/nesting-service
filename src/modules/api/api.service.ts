import { AuthTokenResponse, GetAuthTokenDto, QueuesStatusResponse } from './dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { signatureVerify } from '@polkadot/util-crypto';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { CollectionInfo, Priority, JobName, TokenInfo } from '../../types';
import { ApiAccess } from './api.access';
import { ConfigService } from '@nestjs/config';
import { AdminsConfig } from '../../config';
import { SdkService } from '../sdk';
import { getLoggerPrefix, getJobId, InjectAnalyzerQueue, InjectRenderQueue } from '../utils';
import { MinioService } from '../storage';
import { Queue } from 'bullmq';

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
    private readonly minio: MinioService,
    @InjectAnalyzerQueue private readonly analyzerQueue: Queue,
    @InjectRenderQueue private readonly renderQueue: Queue,
  ) {}

  public async getConfiguration(): Promise<any> {
    const admins = this.config.getOrThrow<AdminsConfig>('admins');

    return {
      admins: admins.adminsAddressList,
    };
  }

  async getQueuesStatus(address: string): Promise<QueuesStatusResponse> {
    this.access.checkIsAdmin(address);

    const getActiveJobCounts = async (queue: Queue): Promise<number> => {
      const { active, prioritized } = await queue.getJobCounts('active', 'prioritized');

      return active + prioritized;
    };

    return {
      analyzer: await getActiveJobCounts(this.analyzerQueue),
      render: await getActiveJobCounts(this.renderQueue),
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

    const tokenInfoArray = tokenIds
      .sort((a, b) => a - b)
      .map((tokenId) => ({
        ...collectionInfo,
        tokenId,
      }));

    await this.addToQueue(tokenInfoArray);

    this.logger.log(`${getLoggerPrefix(collectionInfo)} Added ${tokenIds.length} tokens to queue`);

    return { tokens: tokenIds };
  }

  public async buildToken(address: string, tokenInfo: TokenInfo): Promise<any> {
    this.logger.log(`${getLoggerPrefix(tokenInfo)} Adding token to queue`);

    await this.access.checkTokenAccess(address, tokenInfo);

    await this.addToQueue(tokenInfo);

    return { ok: true };
  }

  private async addToQueue(tokenInfo: TokenInfo | TokenInfo[], priority = Priority.LOW): Promise<void> {
    const asArray = Array.isArray(tokenInfo) ? tokenInfo : [tokenInfo];

    const jobs = asArray.map((token) => ({
      name: JobName.BUILD_TOKEN,
      data: { ...token, priority },
      opts: {
        jobId: getJobId(token),
        priority,
      },
    }));

    await this.analyzerQueue.addBulk(jobs);
  }

  /**
   * Check collection for missing tokens
   * todo - add to REST API ?
   * @param collectionInfo
   */
  async checkCollection(collectionInfo: CollectionInfo): Promise<void> {
    this.logger.log(`${getLoggerPrefix(collectionInfo)} Checking collection`);

    const { chain, collectionId } = collectionInfo;

    const tokenIds = await this.sdk.getCollectionTokens(collectionInfo);
    const sortedTokenIds = tokenIds.sort((a, b) => a - b);

    const existing = await this.minio.getExistingImages(collectionInfo);
    const existingSet = new Set(existing);

    const missingTokenInfo: TokenInfo[] = sortedTokenIds
      .filter((tokenId) => !existingSet.has(`${chain}/${collectionId}/${tokenId}.png`))
      .map((tokenId) => ({
        ...collectionInfo,
        tokenId,
      }));

    await this.addToQueue(missingTokenInfo);

    this.logger.log(`${getLoggerPrefix(collectionInfo)} Checking collection complete`);
  }
}
