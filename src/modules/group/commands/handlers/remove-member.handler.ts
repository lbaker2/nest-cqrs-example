import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RemoveMemberCommand } from '../../../../shared/commands/group/remove-member.command';
import { MemberRemovedEvent } from '../../../../shared/events/group/member-removed.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';
import { Group } from '../../schemas/group.schema';

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler implements ICommandHandler<RemoveMemberCommand> {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    private redisEventBus: RedisEventBusService,
  ) {}

  async execute(command: RemoveMemberCommand): Promise<Group> {
    const { groupId, userId, correlationId, requestUserId } = command;

    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if user is in the group
    const memberIndex = group.memberIds.findIndex(id => id.equals(userObjectId));
    if (memberIndex === -1) {
      throw new Error(`User ${userId} is not in group ${groupId}`);
    }

    // Remove member from group
    group.memberIds.splice(memberIndex, 1);

    // If removing the admin, clear admin field
    if (group.adminId && group.adminId.equals(userObjectId)) {
      group.adminId = undefined;
    }

    const updatedGroup = await group.save();

    // Publish event to Redis
    await this.redisEventBus.publish(
      new MemberRemovedEvent(
        groupId,
        userId,
        correlationId,
        undefined,
        requestUserId,
      ),
    );

    return updatedGroup;
  }
}