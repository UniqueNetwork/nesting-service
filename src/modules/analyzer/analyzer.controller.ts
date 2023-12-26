import { Controller, Inject } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqPatterns, TokenInfo } from '../../types';
import { AnalyzerService } from './analyzer.service';

@Controller()
export class AnalyzerController {
  @Inject(AnalyzerService)
  private analyzerService: AnalyzerService;

  @MessagePattern(RmqPatterns.BUILD_TOKEN)
  public async buildTokenReceiver(@Payload() payload: TokenInfo, @Ctx() context: RmqContext): Promise<void> {
    await this.analyzerService.buildToken(payload);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
