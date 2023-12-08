import { Module } from '@nestjs/common';
import { SdkProvider } from '../sdk';
import { RenderController } from './render.controller';
import { RenderService } from './render.service';

@Module({
  imports: [],
  controllers: [RenderController],
  providers: [RenderService, SdkProvider],
})
export class RenderModule {}
