import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenPayload } from '../../types';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  sign(payload: JwtTokenPayload): string {
    return this.jwtService.sign({
      address: payload.address,
    });
  }
}
