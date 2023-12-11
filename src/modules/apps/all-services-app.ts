import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { GlobalConfigModule } from '../../config';
import { AuthModule } from '../auth/auth.module';
import { AnalyzerModule } from '../analyzer';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RmqQueues, RmqServiceNames } from '../../types';
import { RabbitMQConfig } from '../../config';
import { RenderModule } from '../render';
import {
  BaseExceptionsFilter,
  NotFoundExceptionFilter,
} from '../utils/exception.filters';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    GlobalConfigModule,
    AuthModule,
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          inject: [ConfigService],
          name: RmqServiceNames.ANALYZER_QUEUE_SERVICE,
          useFactory: (config: ConfigService) => {
            const rmqConfig: RabbitMQConfig = config.getOrThrow('rmq');
            return {
              transport: Transport.RMQ,
              options: {
                urls: rmqConfig.urls,
                queue: RmqQueues.ANALYZER_QUEUE,
                queueOptions: {
                  durable: false,
                },
              },
            };
          },
        },
      ],
    }),
    ApiModule,
    AnalyzerModule,
    RenderModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BaseExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
  ],
})
export class AllServicesApp {}
