import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { GlobalConfigModule } from '../../config/config.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [GlobalConfigModule, AuthModule, ApiModule],
  providers: [],
})
export class AllServicesApp {}
