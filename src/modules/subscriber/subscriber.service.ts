import { Inject, Injectable, Logger } from '@nestjs/common';
import { SdkService } from '../sdk';
import { ChainType, RmqPatterns, RmqServiceNames, TokenInfo } from '../../types';
import { CollectionData } from '@unique-nft/sdk';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { recognizers } from './recognizers';

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger('SubscriberService');

  private readonly recognizers = recognizers;

  constructor(
    private readonly sdk: SdkService,
    @Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE)
    private rmqClient: ClientProxy,
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

    this.enqueueToken(rootToken);
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

  private enqueueToken(token: TokenInfo) {
    const sendResult = this.rmqClient.emit<any, TokenInfo>(RmqPatterns.BUILD_TOKEN, token);

    sendResult
      .pipe(
        catchError((err) => {
          this.logger.error('failed add token to queue', token, err);

          return err;
        }),
      )
      .subscribe();
  }
}
