import {
  AdminsConfig,
  ApiConfig,
  AppConfig,
  AuthConfig,
  FetchConfig,
  LoggerConfig,
  MinioConfig,
  RedisConfig,
  QueuesConfig,
  RenderConfig,
  SdkConfig,
} from './config.types';
import * as process from 'process';
import 'dotenv/config';
import { CHAIN_CONFIG } from '@unique-nft/sdk';
import { Address } from '@unique-nft/utils/address';
import { Logger } from '@nestjs/common';
import { LogLevel } from '@nestjs/common/services/logger.service';

const getStringOrThrow = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (!value) throw new Error(`Missing required environment variable: ${key}`);

  return value;
};

const loadApi = (): ApiConfig => ({
  port: +getStringOrThrow('PORT', '3000'),
});

const loadAuth = (): AuthConfig => ({
  jwtSecret: getStringOrThrow('JWT_SECRET'),
  jwtExpiresTime: +getStringOrThrow('JWT_EXPIRES_TIME', '3600'),
});

const loadRedis = (): RedisConfig => ({
  host: getStringOrThrow('REDIS_HOST', 'localhost'),
  port: +getStringOrThrow('REDIS_PORT', '6379'),
});

const loadQueues = (): QueuesConfig => ({
  analyzer: {
    concurrency: +getStringOrThrow('QUEUES_ANALYZER_CONCURRENCY', '5'),
  },
  render: {
    concurrency: +getStringOrThrow('QUEUES_RENDER_CONCURRENCY', '5'),
  },
});

const loadSdk = (): SdkConfig => ({
  opalUrl: getStringOrThrow('OPAL_REST_URL', CHAIN_CONFIG.opal.restUrl),
  quartzUrl: getStringOrThrow('QUARTZ_REST_URL', CHAIN_CONFIG.quartz.restUrl),
  uniqueUrl: getStringOrThrow('UNIQUE_REST_URL', CHAIN_CONFIG.unique.restUrl),
});

const loadRender = (): RenderConfig => ({});

const loadMinio = (): MinioConfig => ({
  endPoint: getStringOrThrow('MINIO_END_POINT'),
  accessKey: getStringOrThrow('MINIO_ACCESS_KEY'),
  secretKey: getStringOrThrow('MINIO_SECRET_KEY'),
  bucketName: getStringOrThrow('MINIO_BUCKET_NAME'),
});

const loadAdmins = (): AdminsConfig => {
  const logger = new Logger('Config.AdminsConfig');

  const adminsAddressList = process.env['ADMINS_ADDRESS_LIST']
    ? process.env['ADMINS_ADDRESS_LIST']
        .split(',')
        .map((address) => address.trim())
        .filter((address) => !!address)
        .filter((address) => {
          const isValid = Address.is.substrateAddress(address);
          if (!isValid) logger.warn(`Invalid admin address: ${address}, skipping`);

          return isValid;
        })
    : [];

  return {
    adminsAddressList,
  };
};

const loadFetch = (): FetchConfig => ({
  timeout: +getStringOrThrow('FETCH_TIMEOUT', '10000'),
  cacheTTL: +getStringOrThrow('FETCH_CACHE_TTL', '15000'),
  cacheMaxItems: +getStringOrThrow('FETCH_CACHE_MAX_ITEMS', '100'),
});

const getLogLevels = (): LogLevel[] => {
  const minLevel = getStringOrThrow('LOG_LEVEL', 'log') as LogLevel;

  const logLevelsSorted: LogLevel[] = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];
  const minLevelIndex = logLevelsSorted.indexOf(minLevel);

  if (minLevelIndex === -1) throw new Error(`Invalid log level: ${minLevel}`);

  return logLevelsSorted.slice(0, minLevelIndex + 1);
};

const loadLogger = (): LoggerConfig => ({
  levels: getLogLevels(),
});

export const configLoad = (): AppConfig => {
  return {
    api: loadApi(),
    auth: loadAuth(),
    redis: loadRedis(),
    queues: loadQueues(),
    sdk: loadSdk(),
    render: loadRender(),
    minio: loadMinio(),
    admins: loadAdmins(),
    fetch: loadFetch(),
    logger: loadLogger(),
  };
};
