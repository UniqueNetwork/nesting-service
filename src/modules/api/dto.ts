import { ApiProperty } from '@nestjs/swagger';
import { Token } from '../../types';

export class GetAuthTokenDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  signature: string;
}

export class AuthTokenResponse {
  @ApiProperty()
  access_token: string;
}

// todo add validators
export class BuildTokenDto implements Token {
  @ApiProperty()
  collectionId: number;

  @ApiProperty()
  tokenId: number;
}
