import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthModule } from '../auth/auth.module';
import { SdkService } from '../sdk';

@Module({
  imports: [AuthModule],
  controllers: [ApiController],
  providers: [ApiService, SdkService],
})
export class ApiModule {}
