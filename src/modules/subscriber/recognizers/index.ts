import { ChainType, TokenInfo } from '../../../types';
import { CollectionData } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils';

type EventRecognizer = (
  chain: ChainType,
  eventData: CollectionData,
) => {
  description: string;
  token: TokenInfo | null;
};

const tryGetTokenFromAddress = (chain: ChainType, address?: string) => {
  if (!address || !Address.is.nestingAddress(address)) return null;

  const { collectionId, tokenId } = Address.nesting.addressToIds(address);

  return { chain, collectionId, tokenId };
};

const tokenNestedRecognizer: EventRecognizer = (chain, eventData) => {
  const { addressTo } = eventData.parsed;

  const token = tryGetTokenFromAddress(chain, addressTo);

  return {
    description: `Another token was nested into parent`,
    token,
  };
};

const tokenUnNestedRecognizer: EventRecognizer = (chain, eventData) => {
  const { address } = eventData.parsed;

  const token = tryGetTokenFromAddress(chain, address);

  return {
    description: `This token was un_nested from parent`,
    token,
  };
};

export const recognizers = [tokenNestedRecognizer, tokenUnNestedRecognizer];
