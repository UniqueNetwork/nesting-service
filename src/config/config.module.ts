import { ConfigModule } from '@nestjs/config';
import { configLoad } from './config.load';

export const GlobalConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configLoad],
  validate: undefined,
});
