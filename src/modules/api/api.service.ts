import { AuthTokenResponse, GetAuthTokenDto } from './dto';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { stringToU8a } from '@polkadot/util';
import { signatureVerify } from '@polkadot/util-crypto';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

@Injectable()
export class ApiService {
  @Inject(AuthService)
  private authService: AuthService;

  public async getAuthToken(body: GetAuthTokenDto): Promise<AuthTokenResponse> {
    const { message, signature, address } = body;
    /*
    const messageU8a = stringToU8a(message);
    const { isValid } = signatureVerify(messageU8a, signature, address);

    if (!isValid) {
      //throw new UnauthorizedException('Invalid signature');
    }
     */

    return {
      access_token: this.authService.sign({
        address,
      }),
    };
  }
}
