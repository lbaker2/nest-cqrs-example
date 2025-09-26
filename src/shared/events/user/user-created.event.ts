import { BaseEvent } from '../base/base.event';

export class UserCreatedEvent extends BaseEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    correlationId?: string,
    causationId?: string,
    requestUserId?: string,
  ) {
    super(userId, correlationId, causationId, requestUserId);
  }
}