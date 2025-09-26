import { Module } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';
import { RedisEventBusService } from './redis-event-bus.service';
import { EventSerializerService } from './event-serializer.service';

@Module({
  imports: [CqrsModule, RedisModule],
  providers: [
    EventSerializerService,
    ConfigService,
    {
      provide: RedisEventBusService,
      useFactory: (
        publisher: any,
        subscriber: any,
        localEventBus: EventBus,
        eventSerializer: EventSerializerService,
        configService: ConfigService,
      ) => {
        return new RedisEventBusService(
          publisher,
          subscriber,
          localEventBus,
          eventSerializer,
          configService,
        );
      },
      inject: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER', EventBus, EventSerializerService, ConfigService],
    },
  ],
  exports: [RedisEventBusService],
})
export class RedisEventBusModule {}