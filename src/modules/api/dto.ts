import { ApiProperty } from '@nestjs/swagger';

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

export class BuildTokenDto {
  @ApiProperty()
  collectionId: number;

  @ApiProperty()
  tokenId: number;
}
