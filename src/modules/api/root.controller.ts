import { Controller, Req, UsePipes, Get, Inject, Redirect, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { createValidationPipe } from './validation';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config';

@ApiTags('Root')
@Controller('/')
export class RootController {
  @Inject(ConfigService)
  private readonly config: ConfigService<AppConfig>;

  @UsePipes(createValidationPipe())
  @ApiParam({ name: 'chain', enum: ['opal', 'quartz', 'unique'] })
  @ApiParam({ name: 'collectionId', type: 'number' })
  @ApiParam({ name: 'tokenId', type: 'number' })
  @Get('/common/:chain/:collectionId/:tokenId')
  @Redirect('', 302)
  async getTokenImage(
    @Req() req: Request,
    @Param('chain') chain: string,
    @Param('collectionId') collectionId: number,
    @Param('tokenId') tokenId: number,
  ) {
    const { endPoint, bucketName } = this.config.get('minio');

    // todo - think about storage response caching
    const antiCache = Date.now();

    const tokenPath = `${chain}/${collectionId}/${tokenId}.png`;
    const url = `https://${endPoint}/${bucketName}/${tokenPath}?${antiCache}`;

    return { url };
  }
}
