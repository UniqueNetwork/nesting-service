import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AuthConfig } from '../../../config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authConfig: AuthConfig;
  constructor(
    private jwtService: JwtService,
    config: ConfigService,
  ) {
    this.authConfig = config.getOrThrow('auth');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;

    const token = this.extractTokenFromHeader(req);
    if (!token) throw new UnauthorizedException();

    try {
      req.jwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.authConfig.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request.headers['authorization']) return undefined;
    const [type, token] = request.headers['authorization'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
