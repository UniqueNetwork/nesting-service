export enum ChainType {
  OPAL = 'opal',
  QUARTZ = 'quartz',
  UNIQUE = 'unique',
}

export interface TokenInfo {
  chain: ChainType;
  collectionId: number;
  tokenId: number;
}

export interface RenderImage {
  url: string;
}

export interface RenderTokenInfo {
  token: TokenInfo;
  images: RenderImage[];
  filename: string;
}
