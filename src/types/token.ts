export enum ChainType {
  OPAL = 'opal',
  QUARTZ = 'quartz',
  UNIQUE = 'unique',
}

export interface CollectionInfo {
  chain: ChainType | `${ChainType}` | string;
  collectionId: number;
}

export interface TokenInfo extends CollectionInfo {
  tokenId: number;
  priority?: number;
}

export interface RenderPoint {
  x: number;
  y: number;
}

export interface RenderImageSpecs {
  order: number[];
  offset: RenderPoint;
  scale: RenderPoint;
  opacity: number;
  rotation: number;
  anchor: RenderPoint;
}

export interface RenderImage {
  url: string;
  specs: RenderImageSpecs;
}

export interface RenderParentImage extends RenderImage {
  children: RenderImage[];
}

export interface RenderTokenInfo {
  tokenInfo: TokenInfo;
  image: RenderParentImage;
}
