import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateGroupCommand } from '../../../../shared/commands/group/update-group.command';
import { GroupUpdatedEvent } from '../../../../shared/events/group/group-updated.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';
import { Group } from '../../schemas/group.schema';

@CommandHandler(UpdateGroupCommand)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroupCommand> {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    private redisEventBus: RedisEventBusService,
  ) {}

  async execute(command: UpdateGroupCommand): Promise<Group> {
    const { groupId, updates, correlationId, requestUserId } = command;

    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    // Update group in write database
    const updateData = {
      ...updates,
      adminId: updates.adminId ? new Types.ObjectId(updates.adminId) : Object.hasOwnProperty.call(updates, 'adminId') ? null : undefined,
    };

    Object.assign(group, updateData);
    const updatedGroup = await group.save();

    // Publish event to Redis
    await this.redisEventBus.publish(
      new GroupUpdatedEvent(
        updatedGroup._id.toString(),
        updates,
        correlationId,
        undefined,
        requestUserId,
      ),
    );

    return updatedGroup;
  }
}