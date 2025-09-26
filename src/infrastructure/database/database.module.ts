import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // application database connection
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.app.uri'),
        ...configService.get('database.app.options'),
        appName: 'nest-cqrs',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}