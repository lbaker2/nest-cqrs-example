import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { GroupCreatedEvent } from '../../../../shared/events/group/group-created.event';
import { GroupResponseDto } from '../../dtos/group-response.dto';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';

@EventsHandler(GroupCreatedEvent)
export class GroupCreatedHandler implements IEventHandler<GroupCreatedEvent>, OnModuleInit {
  private readonly logger = new Logger(GroupCreatedHandler.name);

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private redisEventBus: RedisEventBusService,
  ) {}

  async onModuleInit() {
    // Register this handler with a consumer group for GroupCreatedEvent
    await this.redisEventBus.registerEventHandler(
      'GroupCreatedEvent',
      'group-read-model-group',
      'GroupCreatedHandler'
    );
    this.logger.log('GroupCreatedHandler registered with Redis event bus');
  }

  async handle(event: GroupCreatedEvent) {
    this.logger.log(`Processing GroupCreatedEvent for group ${event.groupId}`);

    try {
      // post group created event processing
      // examples include updating search indexes, notifying other services, etc.
      this.logger.log(`Successfully processed GroupCreatedEvent for group ${event.groupId}`);
    } catch (error) {
      this.logger.error(`Failed to process GroupCreatedEvent for group ${event.groupId}:`, error);
      throw error;
    }
  }
}