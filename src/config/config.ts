export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresTime: number;
}

export interface RabbitMQConfig {
  urls: string[];
}

export interface AppConfig {
  auth: AuthConfig;
  rmq: RabbitMQConfig;
}
