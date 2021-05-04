import { FormDTO, ProjectDTO } from '@automagical/contracts/formio-sdk';
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { FormSchema, ProjectSchema } from './schema';
import { FormService, ProjectService } from './services';

@Module({})
export class PersistenceModule {
  // #region Public Static Methods

  public static mongooseRoot(uri: string): DynamicModule {
    return MongooseModule.forRoot(uri, {
      useCreateIndex: true,
    });
  }

  public static registerMongoose(): DynamicModule {
    const services = [ProjectService, FormService];
    return {
      exports: services,
      imports: [
        MongooseModule.forFeature([
          { name: FormDTO.name, schema: FormSchema },
          { name: ProjectDTO.name, schema: ProjectSchema },
        ]),
      ],
      module: PersistenceModule,
      providers: services,
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
