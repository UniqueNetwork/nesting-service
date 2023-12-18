import { TokenInfo } from './token';

export interface UploadFile {
  token: TokenInfo;
  filename: string;
  content: Buffer;
}
