import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { GroupUpdatedEvent } from '../../../../shared/events/group/group-updated.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';

@EventsHandler(GroupUpdatedEvent)
export class GroupUpdatedHandler implements IEventHandler<GroupUpdatedEvent>, OnModuleInit {
  private readonly logger = new Logger(GroupUpdatedHandler.name);

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private redisEventBus: RedisEventBusService,
  ) {}

  async onModuleInit() {
    // Register this handler with a consumer group for GroupUpdatedEvent
    await this.redisEventBus.registerEventHandler(
      'GroupUpdatedEvent',
      'group-read-model-group',
      'GroupUpdatedHandler'
    );
    this.logger.log('GroupUpdatedHandler registered with Redis event bus');
  }

  async handle(event: GroupUpdatedEvent) {
    this.logger.log(`Processing GroupUpdatedEvent for group ${event.groupId}`);

    try {
      // post update group processing
      // examples include updating search indexes, notifying other services, etc.
      this.logger.log(`Successfully processed GroupUpdatedEvent for group ${event.groupId}`);
    } catch (error) {
      this.logger.error(`Failed to process GroupUpdatedEvent for group ${event.groupId}:`, error);
      throw error;
    }
  }
}