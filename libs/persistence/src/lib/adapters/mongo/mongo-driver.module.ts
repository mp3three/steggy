import { MONGOOSE } from '@automagical/contracts/persistence';
import { DynamicModule, Module } from '@nestjs/common';
import { AccessDriver, ProjectDriver } from './drivers';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

@Module({
  providers: [ProjectDriver, AccessDriver],
  exports: [ProjectDriver, AccessDriver],
})
export class MongoDriverModule {
  // #region Public Static Methods

  public static register(): DynamicModule {
    return {
      module: MongoDriverModule,
      exports: [ProjectDriver, AccessDriver],

      providers: [
        ProjectDriver,
        AccessDriver,
        {
          provide: MONGOOSE,
          inject: [ConfigService],
          useFactory: async (config: ConfigService) => {
            const options = {
              connectTimeoutMS: 300000,
              socketTimeoutMS: 300000,
              useNewUrlParser: true,
              keepAlive: true,
              useCreateIndex: true,
            } as mongoose.ConnectOptions;
            /**
             * TODO ssl
             */
            await mongoose.connect(config.get('MONGO'), options);

            mongoose.set('useFindAndModify', false);
            mongoose.set('useCreateIndex', true);
            return mongoose;
          },
        },
      ],
    };
  }

  // #endregion Public Static Methods
}
