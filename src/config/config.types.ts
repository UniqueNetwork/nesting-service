export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresTime: number;
}

export interface RabbitMQConfig {
  urls: string[];
}

export interface SdkConfig {
  seed?: string;
  url: string;
}

export interface RenderConfig {
  imagesDir: string;
}

export interface AppConfig {
  auth: AuthConfig;
  rmq: RabbitMQConfig;
  sdk: SdkConfig;
  render: RenderConfig;
}
