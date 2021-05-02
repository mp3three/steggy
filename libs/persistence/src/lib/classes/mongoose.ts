import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongooseConnection {
  // #region Object Properties

  private done: (argument) => void;

  // #endregion Object Properties

  // #region Public Methods

  public async onModuleBootstrap(): Promise<void> {
    return new Promise((done) => {
      this.done = done;
      return this.connect();
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private async connect() {
    const options = await this.getOptions();
    /**
     * TODO connection string as array
     * - turns on high availability
     * TODO ssl
     */
    await mongoose.connect(process.env.MONGO, options);

    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
  }

  private async getOptions(): Promise<mongoose.ConnectOptions> {
    return {
      connectTimeoutMS: 300000,
      keepAlive: true,
      socketTimeoutMS: 300000,
      useCreateIndex: true,
      useNewUrlParser: true,
    };
  }

  // #endregion Private Methods
}
