import { Module } from '@nestjs/common';
import { RenderController } from './render.controller';
import { RenderService } from './render.service';
import { MinioModule } from '../storage';

@Module({
  imports: [MinioModule],
  controllers: [RenderController],
  providers: [RenderService],
})
export class RenderModule {}
