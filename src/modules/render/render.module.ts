import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RenderProcessor } from './render.processor';
import { RenderService } from './render.service';
import { MinioModule } from '../storage';
import { ImageFetchService } from './image-fetch.service';
import { CacheService } from './cache.service';

@Module({
  imports: [MinioModule, HttpModule],
  providers: [RenderService, CacheService, ImageFetchService, RenderProcessor],
})
export class RenderModule {}
