import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MONGOOSE } from '@automagical/contracts/persistence';
// import { AccessDriver, ProjectDriver } from './drivers';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

@Module({})
export class PersistenceModule {
  // #region Public Static Methods

  public static registerMongoose(): DynamicModule {
    return {
      module: PersistenceModule,
      providers: [
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

  public static registerTypeorm(
    options: TypeOrmModuleOptions = {},
  ): DynamicModule {
    return {
      module: PersistenceModule,
      imports: [TypeOrmModule.forRoot(options)],
    };
  }

  // #endregion Public Static Methods
}
