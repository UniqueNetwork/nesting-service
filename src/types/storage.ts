import { TokenInfo } from './token';

export interface UploadFile {
  token: TokenInfo;
  content: Buffer;
}
