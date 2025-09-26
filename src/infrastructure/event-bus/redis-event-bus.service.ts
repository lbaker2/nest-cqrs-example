import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { DomainEvent } from '../../common/interfaces/domain-event.interface';
import { EventSerializerService } from './event-serializer.service';
import { UserCreatedEvent } from '../../shared/events/user/user-created.event';
import { UserUpdatedEvent } from '../../shared/events/user/user-updated.event';
import { GroupCreatedEvent } from '../../shared/events/group/group-created.event';
import { GroupUpdatedEvent } from '../../shared/events/group/group-updated.event';
import { MemberAddedEvent } from '../../shared/events/group/member-added.event';
import { MemberRemovedEvent } from '../../shared/events/group/member-removed.event';

interface EventHandler {
  eventType: string;
  consumerGroup: string;
  handler: string;
}

@Injectable()
export class RedisEventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisEventBusService.name);
  private readonly instanceId: string;
  private readonly streamPrefix: string;
  private readonly eventHandlers: Map<string, EventHandler[]> = new Map();
  private isProcessing = false;

  constructor(
    @Inject('REDIS_PUBLISHER') private readonly publisher: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly subscriber: Redis,
    private readonly localEventBus: EventBus,
    private readonly eventSerializer: EventSerializerService,
    private readonly configService: ConfigService,
  ) {
    this.instanceId = this.configService.get<string>('app.instanceId');
    this.streamPrefix = process.env.EVENT_BUS_CHANNEL_PREFIX || 'events';
  }

  async onModuleInit() {
    // Start processing events from streams
    this.isProcessing = true;
    this.processEvents();

    this.logger.log(`Redis EventBus initialized with instance ID: ${this.instanceId}`);
  }

  async onModuleDestroy() {
    this.isProcessing = false;
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  async publish(event: any): Promise<void> {
    const domainEvent: DomainEvent = this.createDomainEvent(event);
    const streamName = `${this.streamPrefix}:${domainEvent.type}`;
    
    try {
      const serializedEvent = this.eventSerializer.serialize(domainEvent);
      
      // Add event to Redis Stream (instead of pub/sub)
      await this.publisher.xadd(
        streamName,
        '*', // Auto-generate ID
        'data', serializedEvent
      );
      
      this.logger.debug(`Published event ${domainEvent.type} with ID ${domainEvent.id} to stream ${streamName}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${domainEvent.type}:`, error);
      throw error;
    }
  }

  // Register event handler types with their consumer groups
  async registerEventHandler(eventType: string, consumerGroup: string, handlerName: string) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push({
      eventType,
      consumerGroup,
      handler: handlerName,
    });

    // Create consumer group if it doesn't exist
    const streamName = `${this.streamPrefix}:${eventType}`;
    try {
      await this.subscriber.xgroup('CREATE', streamName, consumerGroup, '$', 'MKSTREAM');
      this.logger.debug(`Created consumer group ${consumerGroup} for stream ${streamName}`);
    } catch (error) {
      // Group might already exist, ignore error
      if (!error.message.includes('BUSYGROUP')) {
        this.logger.warn(`Failed to create consumer group: ${error.message}`);
      }
    }
  }

  private async processEvents() {
    while (this.isProcessing) {
      try {
        // Process events for each registered handler
        for (const [eventType, handlers] of this.eventHandlers) {
          for (const handler of handlers) {
            await this.processEventStream(eventType, handler);
          }
        }
        
        // Small delay to prevent CPU spinning
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.logger.error('Error in event processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait longer on error
      }
    }
  }

  private async processEventStream(eventType: string, handler: EventHandler) {
    const streamName = `${this.streamPrefix}:${eventType}`;
    const consumerName = `${handler.consumerGroup}-${this.instanceId}`;

    try {
      // Read events from stream with consumer group
      const results = await this.subscriber.xreadgroup(
        'GROUP', handler.consumerGroup, consumerName,
        'COUNT', 1, // Process one event at a time
        'BLOCK', 1000, // Block for 1 second
        'STREAMS', streamName, '>'
      );

      if (results && results.length > 0) {
        const [stream, messages] = (results[0] as [string, [string, string[]][]]);
        
        for (const [messageId, fields] of messages) {
          await this.handleStreamEvent(streamName, messageId, fields, handler);
        }
      }
    } catch (error) {
      // Ignore timeout errors (normal when no events)
      if (!error.message.includes('timeout')) {
        this.logger.error(`Error processing event stream ${streamName}:`, error);
      }
    }
  }

  private async handleStreamEvent(
    streamName: string, 
    messageId: string, 
    fields: string[], 
    handler: EventHandler
  ) {
    try {
      // Fields come as [key, value, key, value, ...]
      const data = fields[1]; // Assuming 'data' is the first field
      const domainEvent = this.eventSerializer.deserialize(data);
      
      this.logger.debug(
        `Processing event ${domainEvent.type} with ID ${domainEvent.id} by handler ${handler.handler}`
      );

      // Forward to local NestJS EventBus - only THIS instance processes it
      // Create the proper event instance based on the event type
      const eventInstance = this.createEventInstance(domainEvent.type, domainEvent.data);
      if (eventInstance) {
        this.localEventBus.publish(eventInstance);
      } else {
        this.logger.warn(`Unknown event type: ${domainEvent.type}`);
      }

      // Acknowledge message (remove from pending list)
      await this.subscriber.xack(streamName, handler.consumerGroup, messageId);
      
      this.logger.debug(`Acknowledged event ${messageId} from stream ${streamName}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle event ${messageId} from stream ${streamName}:`, 
        error
      );
      
      // Could implement retry logic here or move to dead letter queue
    }
  }

  private createDomainEvent(event: any): DomainEvent {
    return {
      id: uuidv4(),
      type: event.constructor.name,
      aggregateId: event.aggregateId || event.id || uuidv4(),
      version: event.version || 1,
      timestamp: new Date(),
      data: event,
      metadata: {
        source: this.instanceId,
        correlationId: event.correlationId,
        causationId: event.causationId,
        userId: event.userId,
      },
    };
  }

  private createEventInstance(eventType: string, eventData: any): any {
    switch (eventType) {
      case 'UserCreatedEvent':
        return new UserCreatedEvent(
          eventData.userId,
          eventData.email,
          eventData.firstName,
          eventData.lastName,
          eventData.correlationId,
          eventData.causationId,
          eventData.userId
        );
      case 'UserUpdatedEvent':
        return new UserUpdatedEvent(
          eventData.userId,
          eventData.updates,
          eventData.correlationId,
          eventData.causationId,
          eventData.requestUserId
        );
      case 'GroupCreatedEvent':
        return new GroupCreatedEvent(
          eventData.groupId,
          eventData.name,
          eventData.description,
          eventData.adminId,
          eventData.maxMembers,
          eventData.correlationId,
          eventData.causationId,
          eventData.requestUserId
        );
      case 'GroupUpdatedEvent':
        return new GroupUpdatedEvent(
          eventData.groupId,
          eventData.updates,
          eventData.correlationId,
          eventData.causationId,
          eventData.requestUserId
        );
      case 'MemberAddedEvent':
        return new MemberAddedEvent(
          eventData.groupId,
          eventData.userId,
          eventData.userEmail,
          eventData.userFirstName,
          eventData.userLastName,
          eventData.correlationId,
          eventData.causationId,
          eventData.requestUserId
        );
      case 'MemberRemovedEvent':
        return new MemberRemovedEvent(
          eventData.groupId,
          eventData.userId,
          eventData.correlationId,
          eventData.causationId,
          eventData.requestUserId
        );
      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
        return null;
    }
  }
}