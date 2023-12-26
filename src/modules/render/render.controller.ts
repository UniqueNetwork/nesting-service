import { Controller, Inject } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { RenderTokenInfo, RmqPatterns } from '../../types';
import { RenderService } from './render.service';

@Controller()
export class RenderController {
  @Inject(RenderService)
  private renderService: RenderService;

  @MessagePattern(RmqPatterns.RENDER_IMAGES)
  public async buildTokenReceiver(@Payload() payload: RenderTokenInfo, @Ctx() context: RmqContext): Promise<void> {
    await this.renderService.render(payload);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
