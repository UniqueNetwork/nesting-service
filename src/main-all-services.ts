import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions } from '@nestjs/microservices';

import { AllServicesApp } from './modules/apps/all-services-app';
import { addSwagger, getQueuesConfigs } from './modules/utils';
import { LoggerConfig } from './config';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create<NestExpressApplication>(AllServicesApp);

  const config = app.get(ConfigService);
  Logger.overrideLogger(config.getOrThrow<LoggerConfig>('logger').levels);

  const queuesConfigs = getQueuesConfigs(config);

  const analyzerMicroservice = app.connectMicroservice<MicroserviceOptions>(queuesConfigs.subscribers.analyzer);
  await analyzerMicroservice.listen();
  logger.log('Analyzer microservice listening');

  const renderMicroservice = app.connectMicroservice<MicroserviceOptions>(queuesConfigs.subscribers.render);
  await renderMicroservice.listen();
  logger.log('Render microservice listening');

  addSwagger(app);

  const port = 3000;
  await app.listen(port);

  logger.log(`Application started at :${port}, swagger: http://localhost:${port}/api/swagger`);
}

bootstrap();
