import { BaseEvent } from '../base/base.event';

export class MemberAddedEvent extends BaseEvent {
  constructor(
    public readonly groupId: string,
    public readonly userId: string,
    public readonly userEmail: string,
    public readonly userFirstName: string,
    public readonly userLastName: string,
    correlationId?: string,
    causationId?: string,
    requestUserId?: string,
  ) {
    super(groupId, correlationId, causationId, requestUserId);
  }
}