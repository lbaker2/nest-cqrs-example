import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get('redis'));
      },
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get('redis'));
      },
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get('redis'));
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER', 'REDIS_CLIENT'],
})
export class RedisModule {}