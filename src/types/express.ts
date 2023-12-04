import { Request } from 'express';
import { JwtTokenPayload } from './auth';

declare module 'express' {
  interface Request {
    jwtPayload: JwtTokenPayload;
  }
}

export type InputRequest = Request;
