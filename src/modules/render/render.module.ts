import { Module } from '@nestjs/common';

import { MinioModule } from '../storage';
import { DownloadModule } from '../download';

import { RenderProcessor } from './render.processor';
import { RenderService } from './render.service';

@Module({
  imports: [MinioModule, DownloadModule],
  providers: [RenderService, RenderProcessor],
})
export class RenderModule {}
