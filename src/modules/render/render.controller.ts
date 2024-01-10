import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';

import { RenderTokenInfo, RmqPatterns } from '../../types';
import { RenderService } from './render.service';

@Controller()
export class RenderController {
  private readonly logger = new Logger(RenderController.name);

  @Inject(RenderService)
  private renderService: RenderService;

  @MessagePattern(RmqPatterns.RENDER_IMAGES)
  public async buildTokenReceiver(@Payload() payload: RenderTokenInfo, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    try {
      await this.renderService.render(payload);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(error);

      // todo: retry with counter ?
      channel.ack(originalMsg);
    }
  }
}
