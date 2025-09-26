import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'nestjs-cqrs-app',
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  instanceId: process.env.INSTANCE_ID || require('uuid').v4(),
}));