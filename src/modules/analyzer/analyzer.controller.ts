import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';

import { RmqPatterns, TokenInfo } from '../../types';
import { AnalyzerService } from './analyzer.service';

@Controller()
export class AnalyzerController {
  private readonly logger = new Logger(AnalyzerController.name);

  @Inject(AnalyzerService)
  private analyzerService: AnalyzerService;

  @MessagePattern(RmqPatterns.BUILD_TOKEN)
  public async buildTokenReceiver(@Payload() payload: TokenInfo, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;

    try {
      await this.analyzerService.buildToken(payload);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(error);

      channel.ack(originalMsg);
    }
  }
}
