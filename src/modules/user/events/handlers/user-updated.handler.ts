import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { UserUpdatedEvent } from '../../../../shared/events/user/user-updated.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent>, OnModuleInit {
  private readonly logger = new Logger(UserUpdatedHandler.name);

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private redisEventBus: RedisEventBusService,
  ) {}

  async onModuleInit() {
    // Register this handler with a consumer group for UserUpdatedEvent
    await this.redisEventBus.registerEventHandler(
      'UserUpdatedEvent',
      'user-read-model-group',
      'UserUpdatedHandler'
    );
    this.logger.log('UserUpdatedHandler registered with Redis event bus');
  }

  async handle(event: UserUpdatedEvent) {
    this.logger.log(`Processing UserUpdatedEvent for user ${event.userId}`);
    // do stuff here
    this.logger.log(`Successfully processed UserUpdatedEvent for user ${event.userId}`);
  }
}