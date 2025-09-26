import { BaseEvent } from '../base/base.event';

export class MemberRemovedEvent extends BaseEvent {
  constructor(
    public readonly groupId: string,
    public readonly userId: string,
    correlationId?: string,
    causationId?: string,
    requestUserId?: string,
  ) {
    super(groupId, correlationId, causationId, requestUserId);
  }
}