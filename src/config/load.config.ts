import { AppConfig } from './config';
import * as process from 'process';
import 'dotenv/config';

export const loadConfig = (): AppConfig => {
  return {
    auth: {
      jwtSecret: process.env['JWT_SECRET'],
      jwtExpiresTime: +process.env['JWT_EXPIRES_TIME'] || 3600,
    },
  };
};
