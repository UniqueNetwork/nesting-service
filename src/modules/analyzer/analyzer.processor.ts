import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { TokenInfo } from '../../types';
import { AnalyzerService } from './analyzer.service';
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AnalyzerQueueProcessor, getLoggerPrefix } from '../utils';
import { ConfigService } from '@nestjs/config';
import { QueuesConfig } from '../../config';

@AnalyzerQueueProcessor
export class AnalyzerProcessor extends WorkerHost implements OnApplicationBootstrap {
  private readonly logger = new Logger(AnalyzerProcessor.name);

  @Inject(AnalyzerService)
  private analyzerService: AnalyzerService;

  constructor(private config: ConfigService) {
    super();
  }

  onApplicationBootstrap() {
    const queuesConfig = this.config.getOrThrow<QueuesConfig>('queues');
    this.worker.concurrency = queuesConfig.analyzer.concurrency;
  }

  async process({ data: tokenInfo }: Job<TokenInfo>) {
    this.logger.log(`${getLoggerPrefix(tokenInfo)} Processing token`);

    await this.analyzerService.buildToken(tokenInfo);
  }

  @OnWorkerEvent('drained')
  onDrained() {
    this.logger.log(`Queue drained`);
  }

  @OnWorkerEvent('error')
  onError(job: Job, error: Error) {
    this.logger.error(`Error processing job ${job.id}: ${error.message}`);
  }
}
