import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { GlobalConfigModule } from '../../config';
import { AuthModule } from '../auth/auth.module';
import { AnalyzerModule } from '../analyzer';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RmqServiceNames } from '../../types';
import { RenderModule } from '../render';
import { BaseExceptionsFilter } from '../utils/exception.filters';
import { APP_FILTER } from '@nestjs/core';
import { MinioModule } from '../storage';
import { SubscriberModule } from '../subscriber';
import { getQueuesConfigs } from '../utils/rmq';

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
          useFactory: (config: ConfigService) => getQueuesConfigs(config).producers.analyzer,
        },
        {
          inject: [ConfigService],
          name: RmqServiceNames.RENDER_QUEUE_SERVICE,
          useFactory: (config: ConfigService) => getQueuesConfigs(config).producers.render,
        },
      ],
    }),
    ApiModule,
    AnalyzerModule,
    RenderModule,
    MinioModule,
    SubscriberModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BaseExceptionsFilter,
    },
  ],
})
export class AllServicesApp {}
