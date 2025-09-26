import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisEventBusModule } from './infrastructure/event-bus/redis-event-bus.module';
import { UserModule } from './modules/user/user.module';
import { GroupModule } from './modules/group/group.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: '.env',
    }),

    // Core CQRS
    CqrsModule,

    // Infrastructure
    DatabaseModule,
    RedisEventBusModule,

    // Business modules
    UserModule,
    GroupModule,
  ],
})
export class AppModule {}