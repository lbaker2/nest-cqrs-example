import { BaseEvent } from '../base/base.event';

export class GroupCreatedEvent extends BaseEvent {
  constructor(
    public readonly groupId: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly adminId?: string,
    public readonly maxMembers?: number,
    correlationId?: string,
    causationId?: string,
    requestUserId?: string,
  ) {
    super(groupId, correlationId, causationId, requestUserId);
  }
}