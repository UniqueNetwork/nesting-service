import { Module } from '@nestjs/common';
import { AnalyzerProcessor } from './analyzer.processor';
import { AnalyzerService } from './analyzer.service';
import { SdkService } from '../sdk';
import { importBullQueues } from '../utils';
import { QueueName } from '../../types';

@Module({
  imports: [importBullQueues(QueueName.ANALYZER_QUEUE, QueueName.RENDER_QUEUE)],
  providers: [AnalyzerService, SdkService, AnalyzerProcessor],
})
export class AnalyzerModule {}
