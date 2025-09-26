import { BaseEvent } from '../base/base.event';

export class UserUpdatedEvent extends BaseEvent {
  constructor(
    public readonly userId: string,
    public readonly updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
    correlationId?: string,
    causationId?: string,
    requestUserId?: string,
  ) {
    super(userId, correlationId, causationId, requestUserId);
  }
}