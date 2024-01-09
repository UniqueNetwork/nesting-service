type PrefixFields = {
  chain: string;
  collectionId: number;
  tokenId?: number;
};

export const getLoggerPrefix = (fields: PrefixFields) => {
  const { chain, collectionId, tokenId } = fields;

  const prefix = `${chain}/${collectionId}`;

  return tokenId ? `[${prefix}/${tokenId}]` : `[${prefix}]`;
};
