import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserCommand } from '../../../../shared/commands/user/create-user.command';
import { UserCreatedEvent } from '../../../../shared/events/user/user-created.event';
import { RedisEventBusService } from '../../../../infrastructure/event-bus/redis-event-bus.service';
import { User } from '../../schemas/user.schema';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private redisEventBus: RedisEventBusService,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, firstName, lastName, correlationId, userId } = command;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Create user in write database
    const user = new this.userModel({
      email,
      firstName,
      lastName,
    });

    const savedUser = await user.save();

    // Publish event to Redis for distributed processing
    await this.redisEventBus.publish(
      new UserCreatedEvent(
        savedUser._id.toString(),
        savedUser.email,
        savedUser.firstName,
        savedUser.lastName,
        correlationId,
        undefined,
        userId,
      ),
    );

    return savedUser;
  }
}