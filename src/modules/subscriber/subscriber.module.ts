import { Module } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { SdkService } from '../sdk';

@Module({
  providers: [SubscriberService, SdkService],
})
export class SubscriberModule {}
