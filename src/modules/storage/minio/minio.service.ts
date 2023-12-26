import { Injectable, Inject, Logger, Global } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Client } from 'minio';
import { FileForUpload } from '../../../types';
import { ConfigService } from '@nestjs/config';
import { MinioConfig } from '../../../config';

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
    const { chain, collectionId, tokenId } = tokenInfo;
    this.logger.log(`upload file: ${chain}-${collectionId}-${tokenId}`);

    const result = await this.minioClient.putObject(this.minioConfig.bucketName, filename, content, metadata);

    this.logger.log(`upload complete: ${result.etag}, ${result.versionId}`);
  }
}
