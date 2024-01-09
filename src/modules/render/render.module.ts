import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RenderController } from './render.controller';
import { RenderService } from './render.service';
import { MinioModule } from '../storage';
import { ImageFetchService } from './image-fetch.service';
import { CacheService } from './cache.service';

@Module({
  imports: [MinioModule, HttpModule],
  controllers: [RenderController],
  providers: [RenderService, CacheService, ImageFetchService],
})
export class RenderModule {}
