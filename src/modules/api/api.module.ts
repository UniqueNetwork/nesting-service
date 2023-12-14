import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthModule } from '../auth/auth.module';
import { SdkService } from '../sdk';
import { ApiAccess } from './api.access';

@Module({
  imports: [AuthModule],
  controllers: [ApiController],
  providers: [ApiService, SdkService, ApiAccess],
})
export class ApiModule {}
