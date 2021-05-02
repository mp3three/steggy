import { ProjectDTO,SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { MONGOOSE } from '@automagical/contracts/persistence';
import { DynamicModule, Module } from '@nestjs/common';
// import { AccessDriver, ProjectDriver } from './drivers';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import mongoose from 'mongoose';

import { FormSchema, ProjectSchema } from './schema';

@Module({})
export class PersistenceModule {
  // #region Public Static Methods

  public static registerMongoose(): DynamicModule {
    return {
      imports: [
        MongooseModule.forFeature([
          { name: SubmissionDTO.name, schema: FormSchema },
          { name: ProjectDTO.name, schema: ProjectSchema },
        ]),
      ],
      module: PersistenceModule,
      providers: [
        {
          inject: [ConfigService],
          provide: MONGOOSE,
          useFactory: async (config: ConfigService) => {
            const options = {
              connectTimeoutMS: 300000,
              keepAlive: true,
              socketTimeoutMS: 300000,
              useCreateIndex: true,
              useNewUrlParser: true,
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
      imports: [TypeOrmModule.forRoot(options)],
      module: PersistenceModule,
    };
  }

  // #endregion Public Static Methods
}
