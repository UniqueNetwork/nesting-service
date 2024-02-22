import { Module } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { SdkService } from '../sdk';
import { importBullQueues } from '../utils';
import { QueueName } from '../../types';

@Module({
  imports: [importBullQueues(QueueName.ANALYZER_QUEUE)],
  providers: [SubscriberService, SdkService],
})
export class SubscriberModule {}
