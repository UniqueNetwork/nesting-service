import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { RenderTokenInfo } from '../../types';
import { RenderService } from './render.service';
import { WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { getLoggerPrefix, RenderQueueProcessor } from '../utils';
import { ConfigService } from '@nestjs/config';
import { QueuesConfig } from '../../config';

@RenderQueueProcessor
export class RenderProcessor extends WorkerHost implements OnApplicationBootstrap {
  private readonly logger = new Logger(RenderProcessor.name);

  constructor(private config: ConfigService) {
    super();
  }

  onApplicationBootstrap() {
    const queuesConfig = this.config.getOrThrow<QueuesConfig>('queues');
    this.worker.concurrency = queuesConfig.render.concurrency;
  }

  @Inject(RenderService)
  private renderService: RenderService;

  async process({ data: renderInfo }: Job<RenderTokenInfo>) {
    this.logger.log(`${getLoggerPrefix(renderInfo.tokenInfo)} Processing render job`);
    await this.renderService.render(renderInfo);
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
