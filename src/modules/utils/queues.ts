import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule, InjectQueue, Processor } from '@nestjs/bullmq';

import { QueueName } from '../../types';

export const InjectAnalyzerQueue = InjectQueue(QueueName.ANALYZER_QUEUE);
export const AnalyzerQueueProcessor = Processor(QueueName.ANALYZER_QUEUE);

export const InjectRenderQueue = InjectQueue(QueueName.RENDER_QUEUE);
export const RenderQueueProcessor = Processor(QueueName.RENDER_QUEUE);

export const importBullForRoot = () =>
  BullModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      return {
        connection: {
          host: config.getOrThrow<string>('redis.host'),
          port: config.getOrThrow<number>('redis.port'),
        },
      };
    },
  });

export const importBullQueues = (...names: QueueName[]) =>
  BullModule.registerQueue(
    ...names.map((name) => ({
      name,
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: true,
      },
    })),
  );
