import { Injectable, Inject, Logger, Global } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Client } from 'minio';
import { UploadFile } from '../../../types';
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

  public async uploadFile(file: UploadFile) {
    const { token, content, filename } = file;
    const { chain, collectionId, tokenId } = token;
    this.logger.log(`upload file: ${chain}-${collectionId}-${tokenId}`);

    const result = await this.minioClient.putObject(
      this.minioConfig.bucketName,
      filename,
      content,
      {
        token,
        timestamp: Math.floor(Date.now() / 1000),
      },
    );

    this.logger.log(`upload complete: ${result.etag}, ${result.versionId}`);
  }
}
