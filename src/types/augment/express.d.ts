import { JwtTokenPayload } from '../auth';

declare module 'express' {
  interface Request {
    jwtPayload: JwtTokenPayload;
  }
}
