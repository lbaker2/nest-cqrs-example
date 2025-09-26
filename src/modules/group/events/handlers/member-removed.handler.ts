import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { MemberRemovedEvent } from '../../../../shared/events/group/member-removed.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';

@EventsHandler(MemberRemovedEvent)
export class MemberRemovedHandler implements IEventHandler<MemberRemovedEvent>, OnModuleInit {
  private readonly logger = new Logger(MemberRemovedHandler.name);

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private redisEventBus: RedisEventBusService,
  ) {}

  async onModuleInit() {
    // Register this handler with a consumer group for MemberRemovedEvent
    await this.redisEventBus.registerEventHandler(
      'MemberRemovedEvent',
      'group-read-model-group',
      'MemberRemovedHandler'
    );
    this.logger.log('MemberRemovedHandler registered with Redis event bus');
  }

  async handle(event: MemberRemovedEvent) {
    this.logger.log(`Processing MemberRemovedEvent: User ${event.userId} removed from group ${event.groupId}`);

    try {
      // post processing of removing a member from a group
      // Example: revoke view permissions from the removed member and parents
      this.logger.log(`Successfully processed MemberRemovedEvent: User ${event.userId} removed from group ${event.groupId}`);
    } catch (error) {
      this.logger.error(`Failed to process MemberRemovedEvent for group ${event.groupId}:`, error);
      throw error;
    }
  }
}