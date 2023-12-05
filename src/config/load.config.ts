import { AppConfig, AuthConfig, RabbitMQConfig } from './config';
import * as process from 'process';
import 'dotenv/config';

const loadAuth = (): AuthConfig => ({
  jwtSecret: process.env['JWT_SECRET'],
  jwtExpiresTime: +process.env['JWT_EXPIRES_TIME'] || 3600,
});

const loadRmq = (): RabbitMQConfig => ({
  urls: [process.env['RABBIT_MQ_URL']],
});

export const loadConfig = (): AppConfig => {
  return {
    auth: loadAuth(),
    rmq: loadRmq(),
  };
};
