import {
  AppConfig,
  AuthConfig,
  RabbitMQConfig,
  RenderConfig,
  SdkConfig,
} from './config.types';
import * as process from 'process';
import 'dotenv/config';

const loadAuth = (): AuthConfig => ({
  jwtSecret: process.env['JWT_SECRET'],
  jwtExpiresTime: +process.env['JWT_EXPIRES_TIME'] || 3600,
});

const loadRmq = (): RabbitMQConfig => ({
  urls: [process.env['RABBIT_MQ_URL']],
});

const loadSdk = (): SdkConfig => ({
  seed: process.env['SDK_SEED'],
  url: process.env['SDK_URL']!,
});

const loadRender = (): RenderConfig => ({
  imagesDir: process.env['RENDER_IMAGES_DIR'],
});

export const configLoad = (): AppConfig => {
  return {
    auth: loadAuth(),
    rmq: loadRmq(),
    sdk: loadSdk(),
    render: loadRender(),
  };
};
