import { Injectable } from '@nestjs/common';
import { DomainEvent } from '../../common/interfaces/domain-event.interface';

@Injectable()
export class EventSerializerService {
  serialize(event: DomainEvent): string {
    return JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString(),
    });
  }

  deserialize(data: string): DomainEvent {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
    };
  }
}