import { CollectionInfo, TokenInfo } from '../../types';

type IdFields = CollectionInfo & Partial<TokenInfo>;

export const getJobId = (fields: IdFields) => {
  const { chain, collectionId, tokenId } = fields;

  const prefix = `${chain}/${collectionId}`;

  return tokenId ? `${prefix}/${tokenId}` : prefix;
};

export const getLoggerPrefix = (fields: IdFields) => {
  return `[${getJobId(fields)}]`;
};
