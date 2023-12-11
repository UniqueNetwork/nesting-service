import { ApiProperty } from '@nestjs/swagger';
import { ChainType, TokenInfo } from '../../types';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class GetAuthTokenDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  signature: string;
}

export class AuthTokenResponse {
  @ApiProperty()
  access_token: string;
}

export class BuildTokenDto implements TokenInfo {
  @ApiProperty()
  @IsEnum(ChainType)
  chain: ChainType;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  collectionId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  tokenId: number;
}
