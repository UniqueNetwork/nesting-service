import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RmqPatterns, TokenInfo } from '../../types';
import { AnalyzerService } from './analyzer.service';

@Controller()
export class AnalyzerController {
  @Inject(AnalyzerService)
  private analyzerService: AnalyzerService;

  @MessagePattern(RmqPatterns.BUILD_TOKEN)
  public async buildTokenReceiver(
    @Payload() payload: TokenInfo,
  ): Promise<void> {
    await this.analyzerService.buildToken(payload);
  }
}
