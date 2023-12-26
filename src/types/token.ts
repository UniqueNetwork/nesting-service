export enum ChainType {
  OPAL = 'opal',
  QUARTZ = 'quartz',
  UNIQUE = 'unique',
}

export interface CollectionInfo {
  chain: ChainType;
  collectionId: number;
}

export interface TokenInfo extends CollectionInfo {
  tokenId: number;
}

export interface RenderImage {
  url: string;
}

export interface RenderTokenInfo {
  tokenInfo: TokenInfo;
  images: RenderImage[];
}
