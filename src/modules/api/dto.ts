import { ApiProperty } from '@nestjs/swagger';
import { ChainType, CollectionInfo, TokenInfo } from '../../types';
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

export class CollectionInfoDto implements CollectionInfo {
  @ApiProperty()
  @IsEnum(ChainType)
  chain: ChainType;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  collectionId: number;
}

export class TokenInfoDto extends CollectionInfoDto implements TokenInfo {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  tokenId: number;
}
