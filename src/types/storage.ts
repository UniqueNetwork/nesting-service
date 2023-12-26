import { TokenInfo } from './token';

export type FileMetadata = {
  'content-type': string;
  timestamp: string;
};

export interface FileForUpload {
  tokenInfo: TokenInfo;
  filename: string;
  content: Buffer;
  metadata: FileMetadata;
}
