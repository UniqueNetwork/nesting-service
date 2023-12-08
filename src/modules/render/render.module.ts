import { Module } from '@nestjs/common';
import { RenderController } from './render.controller';
import { RenderService } from './render.service';

@Module({
  imports: [],
  controllers: [RenderController],
  providers: [RenderService],
})
export class RenderModule {}
