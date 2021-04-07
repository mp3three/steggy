import { Module } from '@nestjs/common';
import { MongoProjectDriver } from './project';
import * as mongoose from 'mongoose';

@Module({
  providers: [
    MongoProjectDriver,
    {
      provide: 'mongoose',
      useFactory: () => {},
    },
  ],
  exports: [MongoProjectDriver],
})
export class MongoDriverModule {
  // #region Public Static Methods

  public static async createConnection(): Promise<void> {
    const options = {
      connectTimeoutMS: 300000,
      socketTimeoutMS: 300000,
      useNewUrlParser: true,
      keepAlive: true,
      useCreateIndex: true,
    } as mongoose.ConnectOptions;
    /**
     * TODO connection string as array
     * - turns on high availability
     * TODO ssl
     */
    await mongoose.connect(process.env.MONGO, options);

    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
  }

  // #endregion Public Static Methods
}
