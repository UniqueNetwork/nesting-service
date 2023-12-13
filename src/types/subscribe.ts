import { CollectionData } from '@unique-nft/sdk';
import { ChainType } from './token';

export type SubscribeCallback = (
  chain: ChainType,
  eventData: CollectionData,
) => void;
