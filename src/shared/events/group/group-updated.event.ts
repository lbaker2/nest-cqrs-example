import { BaseEvent } from '../base/base.event';

export class GroupUpdatedEvent extends BaseEvent {
  constructor(
    public readonly groupId: string,
    public readonly updates: {
      name?: string;
      description?: string;
      adminId?: string;
      maxMembers?: number;
      isActive?: boolean;
    },
    correlationId?: string,
    causationId?: string,
    requestUserId?: string,
  ) {
    super(groupId, correlationId, causationId, requestUserId);
  }
}