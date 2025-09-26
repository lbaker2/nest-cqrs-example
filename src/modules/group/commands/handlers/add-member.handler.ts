import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddMemberCommand } from '../../../../shared/commands/group/add-member.command';
import { MemberAddedEvent } from '../../../../shared/events/group/member-added.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';
import { Group } from '../../schemas/group.schema';
import { User } from '../../../user/schemas/user.schema';

@CommandHandler(AddMemberCommand)
export class AddMemberHandler implements ICommandHandler<AddMemberCommand> {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(User.name) private userModel: Model<User>,
    private redisEventBus: RedisEventBusService,
  ) {}

  async execute(command: AddMemberCommand): Promise<Group> {
    const { groupId, userId, correlationId, requestUserId } = command;

    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if user is already in the group
    if (group.memberIds.some(id => id.equals(userObjectId))) {
      throw new Error(`User ${userId} is already in group ${groupId}`);
    }

    // Check group capacity
    if (group.maxMembers > 0 && group.memberIds.length >= group.maxMembers) {
      throw new Error(`Group ${groupId} is at maximum capacity (${group.maxMembers} members)`);
    }

    // Add member to group
    group.memberIds.push(userObjectId);
    const updatedGroup = await group.save();

    // Publish event to Redis
    await this.redisEventBus.publish(
      new MemberAddedEvent(
        groupId,
        userId,
        user.email,
        user.firstName,
        user.lastName,
        correlationId,
        undefined,
        requestUserId,
      ),
    );

    return updatedGroup;
  }
}