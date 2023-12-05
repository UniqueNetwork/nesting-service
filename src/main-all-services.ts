import { NestFactory } from '@nestjs/core';
import { AllServicesApp } from './modules/apps/all-services-app';
import { addSwagger } from './modules/utils/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConfig } from './config';
import { RmqQueues } from './types';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AllServicesApp);

  const config = app.get(ConfigService);
  const rmqConfig = config.getOrThrow<RabbitMQConfig>('rmq');

  const ms = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: rmqConfig.urls,
      queue: RmqQueues.ANALYZER_QUEUE,
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });
  const res = await ms.listen();
  console.log('ms listen, res', res);

  addSwagger(app);

  const port = 3000;
  await app.listen(port);

  console.log(
    `Application started at :${port}, swagger: http://localhost:${port}/api/swagger`,
  );
}
bootstrap();
