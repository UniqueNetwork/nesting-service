import { TokenInfo } from './token';

export interface UploadFile {
  token: TokenInfo;
  // todo - do not use path and dumping file to disk, use buffer instead
  filePath: string;
}
