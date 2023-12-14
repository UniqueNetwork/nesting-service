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

  private filenameTemplate: string;

  constructor(
    config: ConfigService,
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
  ) {
    this.minioConfig = config.getOrThrow<MinioConfig>('minio');

    this.filenameTemplate = this.minioConfig.filenameTemplate;
  }

  private getFilename(file: UploadFile) {
    const { token } = file;
    const { chain, collectionId, tokenId } = token;

    return this.filenameTemplate
      .replace('${chain}', chain)
      .replace('${collectionId}', `${collectionId}`)
      .replace('${tokenId}', `${tokenId}`);
  }

  public async uploadFile(file: UploadFile) {
    const { token, filePath } = file;
    const { chain, collectionId, tokenId } = token;
    this.logger.log(
      `upload file: ${chain}-${collectionId}-${tokenId}, ${filePath}`,
    );

    const filename = this.getFilename(file);

    const result = await this.minioClient.fPutObject(
      this.minioConfig.bucketName,
      filename,
      filePath,
      {
        token,
        timestamp: Math.floor(Date.now() / 1000),
      },
    );

    this.logger.log(`upload complete: ${result.etag}, ${result.versionId}`);
  }
}
