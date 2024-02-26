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

export interface RenderImageSpecs {
  order: number[];
  position: {
    x: number;
    y: number;
  };
  scale: {
    x: number;
    y: number;
  };
  opacity: number;
  rotation: number;
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
