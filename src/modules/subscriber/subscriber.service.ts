import { Inject, Injectable, Logger } from '@nestjs/common';
import { SdkService } from '../sdk';
import {
  ChainType,
  RmqPatterns,
  RmqServiceNames,
  TokenInfo,
} from '../../types';
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

  private extractTokenFromAddress(
    chain: ChainType,
    address: string,
  ): TokenInfo | null {
    return address && Address.is.nestingAddress(address)
      ? {
          chain,
          ...Address.nesting.addressToIds(address),
        }
      : null;
  }

  private async onEvent(chain: ChainType, eventData: CollectionData) {
    const { address, addressTo } = eventData.parsed;

    const parentToken: TokenInfo | null =
      this.extractTokenFromAddress(chain, address) ||
      this.extractTokenFromAddress(chain, addressTo);

    if (!parentToken) {
      return;
    }

    this.logger.log(`parse event`, parentToken);

    const bundle = await this.sdk.getBundle(parentToken);

    const rootToken: TokenInfo = {
      chain,
      collectionId: bundle.collectionId,
      tokenId: bundle.tokenId,
    };

    const sendResult = this.rmqClient.emit<any, TokenInfo>(
      RmqPatterns.BUILD_TOKEN,
      rootToken,
    );

    sendResult
      .pipe(
        catchError((err) => {
          this.logger.error('fail add token to queue', eventData, err);
          return err;
        }),
      )
      .subscribe();
  }
}
