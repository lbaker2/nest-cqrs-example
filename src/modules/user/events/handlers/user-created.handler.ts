import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { UserCreatedEvent } from '../../../../shared/events/user/user-created.event';
import { UserResponseDto } from '../../dtos/user-response.dto';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent>, OnModuleInit {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private redisEventBus: RedisEventBusService,
  ) {}

  async onModuleInit() {
    // Register this handler with a consumer group for UserCreatedEvent
    await this.redisEventBus.registerEventHandler(
      'UserCreatedEvent',
      'user-read-model-group',
      'UserCreatedHandler'
    );
    this.logger.log('UserCreatedHandler registered with Redis event bus');
  }

  async handle(event: UserCreatedEvent) {
    this.logger.log(`Processing UserCreatedEvent for user ${event.userId}`);

    try {
      // post user created event processing
      this.logger.log(`Successfully processed UserCreatedEvent for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to process UserCreatedEvent for user ${event.userId}:`, error);
      throw error;
    }
  }
}