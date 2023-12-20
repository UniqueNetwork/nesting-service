import { NestFactory } from '@nestjs/core';
import { AllServicesApp } from './modules/apps/all-services-app';
import { addSwagger } from './modules/utils/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConfig } from './config';
import { RmqQueues } from './types';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create<NestExpressApplication>(AllServicesApp);

  const config = app.get(ConfigService);
  const rmqConfig = config.getOrThrow<RabbitMQConfig>('rmq');

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: rmqConfig.urls,
      queue: RmqQueues.ANALYZER_QUEUE,
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });
  await microservice.listen();
  logger.log('Microservice listening');

  addSwagger(app);

  const port = 3000;
  await app.listen(port);

  logger.log(
    `Application started at :${port}, swagger: http://localhost:${port}/api/swagger`,
  );
}

bootstrap();
