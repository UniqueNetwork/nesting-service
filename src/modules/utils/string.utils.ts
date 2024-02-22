type PrefixFields = {
  chain: string;
  collectionId: number;
  tokenId?: number;
};

export const getJobId = (fields: PrefixFields) => {
  const { chain, collectionId, tokenId } = fields;

  const prefix = `${chain}/${collectionId}`;

  return tokenId ? `${prefix}/${tokenId}` : prefix;
};

export const getLoggerPrefix = (fields: PrefixFields) => {
  return `[${getJobId(fields)}]`;
};
