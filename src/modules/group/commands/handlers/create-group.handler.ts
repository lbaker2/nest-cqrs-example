import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateGroupCommand } from '../../../../shared/commands/group/create-group.command';
import { GroupCreatedEvent } from '../../../../shared/events/group/group-created.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';
import { Group } from '../../schemas/group.schema';

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    private redisEventBus: RedisEventBusService,
  ) {}

  async execute(command: CreateGroupCommand): Promise<Group> {
    const { name, description, adminId, maxMembers, correlationId, userId } = command;

    // Check if group already exists
    const existingGroup = await this.groupModel.findOne({ name });
    if (existingGroup) {
      throw new Error(`Group with name ${name} already exists`);
    }

    // Create group in write database
    const group = new this.groupModel({
      name,
      description,
      adminId: adminId ? new Types.ObjectId(adminId) : undefined,
      maxMembers: maxMembers || 11,
      memberIds: adminId ? [new Types.ObjectId(adminId)] : [],
    });

    const savedGroup = await group.save();

    // Publish event to Redis for distributed processing
    await this.redisEventBus.publish(
      new GroupCreatedEvent(
        savedGroup._id.toString(),
        savedGroup.name,
        savedGroup.description,
        adminId,
        savedGroup.maxMembers,
        correlationId,
        undefined,
        userId,
      ),
    );

    return savedGroup;
  }
}