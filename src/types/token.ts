export interface Token {
  collectionId: number;
  tokenId: number;
}

export interface RenderImage {
  url: string;
}

export interface RenderTokenInfo {
  token: Token;
  images: RenderImage[];
  filename: string;
}
