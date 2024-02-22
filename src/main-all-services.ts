import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AllServicesApp } from './modules/apps/all-services-app';
import { addSwagger } from './modules/utils';
import { LoggerConfig } from './config';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create<NestExpressApplication>(AllServicesApp);

  const config = app.get(ConfigService);
  Logger.overrideLogger(config.getOrThrow<LoggerConfig>('logger').levels);

  addSwagger(app);

  const port = config.getOrThrow<number>('api.port');
  await app.listen(port);

  logger.log(`Application started at :${port}, swagger: http://localhost:${port}/api/swagger`);
}

bootstrap();
