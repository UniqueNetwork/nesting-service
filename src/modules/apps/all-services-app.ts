import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { GlobalConfigModule } from '../../config';
import { AuthModule } from '../auth/auth.module';
import { AnalyzerModule } from '../analyzer';
import { RenderModule } from '../render';
import { BaseExceptionsFilter, importBullForRoot } from '../utils';
import { APP_FILTER } from '@nestjs/core';
import { MinioModule } from '../storage';
import { SubscriberModule } from '../subscriber';

@Module({
  imports: [
    GlobalConfigModule,
    AuthModule,
    importBullForRoot(),
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
