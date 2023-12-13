import {
  AppConfig,
  AuthConfig,
  MinioConfig,
  RabbitMQConfig,
  RenderConfig,
  SdkConfig,
} from './config.types';
import * as process from 'process';
import 'dotenv/config';
import { CHAIN_CONFIG } from '@unique-nft/sdk'

const loadAuth = (): AuthConfig => ({
  jwtSecret: process.env['JWT_SECRET'],
  jwtExpiresTime: +process.env['JWT_EXPIRES_TIME'] || 3600,
});

const loadRmq = (): RabbitMQConfig => ({
  urls: [process.env['RABBIT_MQ_URL']],
});

const loadSdk = (): SdkConfig => ({
  opalUrl: process.env['OPAL_REST_URL'] || CHAIN_CONFIG.opal.restUrl,
  quartzUrl: process.env['QUARTZ_REST_URL'] || CHAIN_CONFIG.quartz.restUrl,
  uniqueUrl: process.env['UNIQUE_REST_URL'] || CHAIN_CONFIG.unique.restUrl,
});

const loadRender = (): RenderConfig => ({
  imagesDir: process.env['RENDER_IMAGES_DIR'],
});

const loadMinio = (): MinioConfig => ({
  endPoint: process.env['MINIO_END_POINT'],
  accessKey: process.env['MINIO_ACCESS_KEY'],
  secretKey: process.env['MINIO_SECRET_KEY'],
  bucketName: process.env['MINIO_BUCKET_NAME'],
  filenameTemplate: process.env['MINIO_FILENAME_TEMPLATE'] || '${chain}/${collectionId}-${tokenId}.jpg',
});

export const configLoad = (): AppConfig => {
  return {
    auth: loadAuth(),
    rmq: loadRmq(),
    sdk: loadSdk(),
    render: loadRender(),
    minio: loadMinio(),
  };
};
