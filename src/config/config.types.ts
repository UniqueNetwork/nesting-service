export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresTime: number;
}

export interface RabbitMQConfig {
  urls: string[];
}

export interface SdkConfig {
  opalUrl: string;
  quartzUrl: string;
  uniqueUrl: string;
}

export interface RenderConfig {
  imagesDir: string;
}

export interface MinioConfig {
  endPoint: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  filenameTemplate: string | null;
}

export interface AppConfig {
  auth: AuthConfig;
  rmq: RabbitMQConfig;
  sdk: SdkConfig;
  render: RenderConfig;
  minio: MinioConfig;
}
