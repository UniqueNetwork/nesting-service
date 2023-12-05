import { Injectable, Logger } from '@nestjs/common';
import { Token } from '../../types';

@Injectable()
export class AnalyzerService {
  private logger = new Logger(AnalyzerService.name);

  public async buildToken(token: Token): Promise<void> {
    this.logger.log('Build token', token);
  }
}
