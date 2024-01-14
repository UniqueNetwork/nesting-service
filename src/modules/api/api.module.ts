import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthModule } from '../auth/auth.module';
import { SdkService } from '../sdk';
import { ApiAccess } from './api.access';
import { RootController } from './root.controller';
import { MinioModule } from '../storage';
import { importBullQueues } from '../utils';
import { QueueName } from '../../types';

@Module({
  imports: [AuthModule, MinioModule, importBullQueues(QueueName.ANALYZER_QUEUE, QueueName.RENDER_QUEUE)],
  controllers: [ApiController, RootController],
  providers: [ApiService, SdkService, ApiAccess],
})
export class ApiModule {}
