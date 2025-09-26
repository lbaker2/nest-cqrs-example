import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserCommand } from '../../../../shared/commands/user/update-user.command';
import { UserUpdatedEvent } from '../../../../shared/events/user/user-updated.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';
import { User } from '../../schemas/user.schema';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private redisEventBus: RedisEventBusService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { userId, updates, correlationId, requestUserId } = command;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Update user in write database
    Object.assign(user, updates);
    const updatedUser = await user.save();

    // Publish event to Redis
    await this.redisEventBus.publish(
      new UserUpdatedEvent(
        updatedUser._id.toString(),
        updates,
        correlationId,
        undefined,
        requestUserId,
      ),
    );

    return updatedUser;
  }
}