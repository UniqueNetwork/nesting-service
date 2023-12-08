import { Module } from '@nestjs/common';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerService } from './analyzer.service';
import { SdkProvider } from '../sdk';

@Module({
  imports: [],
  controllers: [AnalyzerController],
  providers: [AnalyzerService, SdkProvider],
})
export class AnalyzerModule {}
