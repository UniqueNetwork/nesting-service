import { Inject, Injectable, Logger } from '@nestjs/common';
import { SdkService } from '../sdk';
import { ChainType, RmqPatterns, RmqServiceNames, TokenInfo } from '../../types';
import { CollectionData } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger('SubscriberService');

  constructor(
    private readonly sdk: SdkService,
    @Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE)
    private rmqClient: ClientProxy,
  ) {
    sdk.subscribe(this.onEvent.bind(this));
  }

  private extractTokenFromAddress(chain: ChainType, address?: string): TokenInfo | null {
    if (!address || !Address.is.nestingAddress(address)) return null;

    const { collectionId, tokenId } = Address.nesting.addressToIds(address);

    return { chain, collectionId, tokenId };
  }

  private extractTokenFromEvent(chain: ChainType, eventData: CollectionData): TokenInfo | null {
    const { address, addressTo } = eventData.parsed;

    const tokenFrom = this.extractTokenFromAddress(chain, address);
    const tokenTo = this.extractTokenFromAddress(chain, addressTo);
    const parentToken = tokenFrom || tokenTo;

    if (parentToken) {
      this.logger.log(`Found nesting event`);

      return parentToken;
    }

    return null;
  }

  private async onEvent(chain: ChainType, eventData: CollectionData) {
    const {
      event: { method, section, block },
    } = eventData;

    this.logger.log(`Received event ${section}.${method} on ${chain}. Block: ${block?.id}`);

    const parentToken = this.extractTokenFromEvent(chain, eventData);

    if (!parentToken) {
      this.logger.log(`No token found, ignoring event.`);

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
