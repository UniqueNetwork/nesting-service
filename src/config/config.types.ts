import { LogLevel } from '@nestjs/common/services/logger.service';

export interface ApiConfig {
  port: number;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresTime: number;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface QueuesConfig {
  analyzer: {
    concurrency: number;
  };
  render: {
    concurrency: number;
  };
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
  api: ApiConfig;
  auth: AuthConfig;
  redis: RedisConfig;
  queues: QueuesConfig;
  sdk: SdkConfig;
  render: RenderConfig;
  minio: MinioConfig;
  admins: AdminsConfig;
  fetch: FetchConfig;
  logger: LoggerConfig;
}
