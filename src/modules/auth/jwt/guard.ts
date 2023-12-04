import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '../../../config';
import { InputRequest } from '../../../types';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authConfig: AuthConfig;
  constructor(config: ConfigService, private jwtService: JwtService) {
    this.authConfig = config.getOrThrow('auth');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: InputRequest = context
      .switchToHttp()
      .getRequest() as InputRequest;

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      req.jwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.authConfig.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: InputRequest): string | undefined {
    const [type, token] = request.headers['authorization'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
