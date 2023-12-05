import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConfig } from '../../config';
import { RmqQueues, RmqServiceNames } from '../../types';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync({
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
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
