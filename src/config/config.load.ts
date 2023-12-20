import {
  AdminsConfig,
  AppConfig,
  AuthConfig,
  MinioConfig,
  RabbitMQConfig,
  RenderConfig,
  SdkConfig,
} from './config.types';
import * as process from 'process';
import 'dotenv/config';
import { CHAIN_CONFIG } from '@unique-nft/sdk';

const getStringOrThrow = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (!value) throw new Error(`Missing required environment variable: ${key}`);

  return value;
};

const loadAuth = (): AuthConfig => ({
  jwtSecret: getStringOrThrow('JWT_SECRET'),
  jwtExpiresTime: +getStringOrThrow('JWT_EXPIRES_TIME', '3600'),
});

const loadRmq = (): RabbitMQConfig => ({
  urls: [getStringOrThrow('RABBIT_MQ_URL')],
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

const loadAdmins = (): AdminsConfig => ({
  adminsAddressList: process.env['ADMINS_ADDRESS_LIST']
    ? process.env['ADMINS_ADDRESS_LIST']
        .split(',')
        .map((address) => address.trim())
        .filter((address) => !!address)
    : [],
});

export const configLoad = (): AppConfig => {
  return {
    auth: loadAuth(),
    rmq: loadRmq(),
    sdk: loadSdk(),
    render: loadRender(),
    minio: loadMinio(),
    admins: loadAdmins(),
  };
};
