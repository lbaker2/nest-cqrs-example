import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // change the options to match production implementation
  // for now we are just simulating the database administration
  app: {
    uri: process.env.MONGODB_WRITE_URI || 'mongodb://localhost:27017/app_write',
    options: {
      maxPoolSize: 10,
      writeConcern: { w: 'majority', j: true },
      readPreference: 'secondaryPreferred',
    },
  },
}));