import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheService } from './cache.service';
import { HttpDownloadService } from './http.download.service';
import { DownloadService } from './download.service';
import { heliaProvider, HeliaDownloadService, heliaUnixfsProvider } from './helia.download.service';

@Module({
  imports: [HttpModule],
  providers: [
    CacheService,
    HttpDownloadService,
    heliaProvider,
    heliaUnixfsProvider,
    HeliaDownloadService,
    DownloadService,
  ],
  exports: [DownloadService],
})
export class DownloadModule {}
