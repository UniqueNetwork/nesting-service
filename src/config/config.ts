export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresTime: number;
}

export interface AppConfig {
  auth: AuthConfig;
}
