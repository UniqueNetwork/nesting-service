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

export class QueuesStatusResponse {
  @ApiProperty()
  analyzer: number;

  @ApiProperty()
  render: number;
}

export class BuildCollectionDto implements CollectionInfo {
  @ApiProperty()
  @IsEnum(ChainType)
  chain: ChainType;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  collectionId: number;
}

export class BuildTokenDto extends BuildCollectionDto implements TokenInfo {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  tokenId: number;
}
