import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisEventBusModule } from '../../infrastructure/event-bus/redis-event-bus.module';
import { GroupController } from './group.controller';
import { Group, GroupSchema } from './schemas/group.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';

@Module({
  imports: [
    CqrsModule,
    RedisEventBusModule,
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GroupController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class GroupModule {}