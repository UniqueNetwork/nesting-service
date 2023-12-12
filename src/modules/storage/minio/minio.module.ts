import { Module } from '@nestjs/common';
import { NestMinioModule } from 'nestjs-minio';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { MinioConfig } from '../../../config';

@Module({
  controllers: [],
  imports: [
    NestMinioModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const minioConfig = config.getOrThrow<MinioConfig>('minio');
        const { endPoint, accessKey, secretKey } = minioConfig;
        return {
          endPoint,
          accessKey,
          secretKey,
          useSSL: true,
        };
      },
    }),
  ],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
