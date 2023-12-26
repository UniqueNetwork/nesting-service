import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { RmqQueues, RmqServiceNames } from '../../types';
import { RabbitMQConfig } from '../../config';
import { RmqOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';
import { Inject } from '@nestjs/common';

type QueueConfigs = {
  producers: {
    analyzer: RmqOptions;
    render: RmqOptions;
  };
  subscribers: {
    analyzer: RmqOptions;
    render: RmqOptions;
  };
};

export const getQueuesConfigs = (config: ConfigService): QueueConfigs => {
  const rmqConfig = config.getOrThrow<RabbitMQConfig>('rmq');

  const transport = Transport.RMQ;
  const options: RmqOptions['options'] = {
    urls: rmqConfig.urls,
    queueOptions: { durable: false },
    prefetchCount: rmqConfig.prefetchCount,
  };

  return {
    producers: {
      analyzer: {
        transport,
        options: {
          ...options,
          queue: RmqQueues.ANALYZER_QUEUE,
          noAck: true,
        },
      },
      render: {
        transport,
        options: {
          ...options,
          queue: RmqQueues.RENDER_QUEUE,
          noAck: true,
        },
      },
    },
    subscribers: {
      analyzer: {
        transport,
        options: {
          ...options,
          queue: RmqQueues.ANALYZER_QUEUE,
          noAck: false,
        },
      },
      render: {
        transport,
        options: {
          ...options,
          queue: RmqQueues.RENDER_QUEUE,
          noAck: false,
        },
      },
    },
  };
};

export const InjectAnalyzerQueue = Inject(RmqServiceNames.ANALYZER_QUEUE_SERVICE);

export const InjectRenderQueue = Inject(RmqServiceNames.RENDER_QUEUE_SERVICE);
