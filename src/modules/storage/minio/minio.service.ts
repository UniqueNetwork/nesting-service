import { Injectable, Inject, Logger, Global } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

import { FileForUpload } from '../../../types';
import { MinioConfig } from '../../../config';
import { getLoggerPrefix } from '../../utils';

@Injectable()
@Global()
export class MinioService {
  private readonly logger = new Logger('MinioService');

  private readonly minioConfig: MinioConfig;

  constructor(
    config: ConfigService,
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
  ) {
    this.minioConfig = config.getOrThrow<MinioConfig>('minio');
  }

  public async upload(file: FileForUpload) {
    const { tokenInfo, content, filename, metadata } = file;

    this.logger.log(`${getLoggerPrefix(tokenInfo)} Going to upload file`);

    await this.minioClient.putObject(this.minioConfig.bucketName, filename, content, metadata);

    this.logger.log(`${getLoggerPrefix(tokenInfo)} Upload complete`);
  }
}
