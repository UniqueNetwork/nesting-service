import { NestFactory } from '@nestjs/core';
import { AllServicesApp } from './modules/apps/all-services-app';
import { addSwagger } from './modules/utils/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AllServicesApp);

  addSwagger(app);

  const port = 3000;
  await app.listen(port);

  console.log(
    `Application started at :${port}, swagger: http://localhost:${port}/api/swagger`,
  );
}
bootstrap();
