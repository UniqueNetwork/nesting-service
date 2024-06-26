import { Injectable, Logger } from '@nestjs/common';
import { CollectionData } from '@unique-nft/sdk';

import { ChainType, JobName, TokenInfo } from '../../types';
import { SdkService } from '../sdk';
import { recognizers } from './recognizers';
import { getJobId, getLoggerPrefix, InjectAnalyzerQueue } from '../utils';
import { Queue } from 'bullmq';


@Injectable()
export class SubscriberService {
  private readonly logger = new Logger('SubscriberService');

  private readonly recognizers = recognizers;

  constructor(
    private readonly sdk: SdkService,
    @InjectAnalyzerQueue private readonly analyzerQueue: Queue,
  ) {
    sdk.subscribe(this.onEvent.bind(this));
  }

  private async onEvent(chain: ChainType, eventData: CollectionData) {
    const {
      event: { method, section },
      extrinsic: { block },
    } = eventData;

    this.logger.log(`Received event ${section}.${method} on ${chain}. Block: ${block?.id}`);

    const parentToken = this.extractTokenFromEvent(chain, eventData);

    if (!parentToken) {
      this.logger.debug(`No token found, ignoring event.`);

      return;
    }

    const bundle = await this.sdk.getBundle(parentToken);

    const rootToken: TokenInfo = {
      chain,
      collectionId: bundle.collectionId,
      tokenId: bundle.tokenId,
    };

    const imageObject = bundle.image as { fullUrl?: string, url?: string } | undefined;
    const isUsingNestingService = imageObject?.fullUrl?.includes('nesting') || imageObject?.url?.includes('nesting');

    if (!isUsingNestingService) {
      this.logger.log(`${getLoggerPrefix(rootToken)} Token is not using nesting service, ignoring token`);
      return;
    }

    await this.enqueueToken(rootToken);
    this.logger.log(`${getLoggerPrefix(rootToken)} Enqueued token`);
  }

  private extractTokenFromEvent(chain: ChainType, eventData: CollectionData): TokenInfo | null {
    for (const recognizer of this.recognizers) {
      const { token, description } = recognizer(chain, eventData);

      if (token) {
        this.logger.debug(description);

        return token;
      }
    }

    return null;
  }

  private async enqueueToken(token: TokenInfo) {
    await this.analyzerQueue.add(JobName.BUILD_TOKEN, token, { jobId: getJobId(token) });
  }
}
