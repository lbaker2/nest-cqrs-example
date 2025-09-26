import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { MemberAddedEvent } from '../../../../shared/events/group/member-added.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';

@EventsHandler(MemberAddedEvent)
export class MemberAddedHandler implements IEventHandler<MemberAddedEvent>, OnModuleInit {
  private readonly logger = new Logger(MemberAddedHandler.name);

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private redisEventBus: RedisEventBusService,
  ) {}

  async onModuleInit() {
    // Register this handler with a consumer group for MemberAddedEvent
    await this.redisEventBus.registerEventHandler(
      'MemberAddedEvent',
      'group-member-permission-model-group',
      'MemberAddedHandler'
    );

    this.logger.log('MemberAddedHandler registered with Redis event bus');
  }

  async handle(event: MemberAddedEvent) {
    this.logger.log(`Processing MemberAddedEvent: User ${event.userId} added to group ${event.groupId}`);

    try {
      // post processing of adding a member to a group
      // Example: grant view permissions to the new member and parents
      this.logger.log(`Successfully processed MemberAddedEvent: User ${event.userId} added to group ${event.groupId}`);
    } catch (error) {
      this.logger.error(`Failed to process MemberAddedEvent for group ${event.groupId}:`, error);
      throw error;
    }
  }
}