import { LogLevel } from '@nestjs/common/services/logger.service';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresTime: number;
}

export interface RabbitMQConfig {
  urls: string[];
  prefetchCount: number;
}

export interface SdkConfig {
  opalUrl: string;
  quartzUrl: string;
  uniqueUrl: string;
}

export interface RenderConfig {}

export interface LoggerConfig {
  levels: LogLevel[];
}

export interface MinioConfig {
  endPoint: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export interface AdminsConfig {
  adminsAddressList: string[];
}

export interface FetchConfig {
  timeout: number;
  cacheTTL: number;
  cacheMaxItems: number;
}

export interface AppConfig {
  auth: AuthConfig;
  rmq: RabbitMQConfig;
  sdk: SdkConfig;
  render: RenderConfig;
  minio: MinioConfig;
  admins: AdminsConfig;
  fetch: FetchConfig;
  logger: LoggerConfig;
}
