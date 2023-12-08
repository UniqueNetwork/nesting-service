import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RenderTokenInfo, RmqPatterns } from '../../types';
import { RenderService } from './render.service';

@Controller()
export class RenderController {
  @Inject(RenderService)
  private renderService: RenderService;

  @MessagePattern(RmqPatterns.RENDER_IMAGES)
  public async buildTokenReceiver(
    @Payload() payload: RenderTokenInfo,
  ): Promise<void> {
    await this.renderService.render(payload);
  }
}
