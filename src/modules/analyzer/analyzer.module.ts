import { Module } from '@nestjs/common';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerService } from './analyzer.service';
import { SdkService } from '../sdk';

@Module({
  imports: [],
  controllers: [AnalyzerController],
  providers: [AnalyzerService, SdkService],
})
export class AnalyzerModule {}
