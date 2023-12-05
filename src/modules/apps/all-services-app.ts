import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { GlobalConfigModule } from '../../config/config.module';
import { AuthModule } from '../auth/auth.module';
import { AnalyzerModule } from '../analyzer/analyzer.module';

@Module({
  imports: [GlobalConfigModule, AuthModule, ApiModule, AnalyzerModule],
  providers: [],
})
export class AllServicesApp {}
