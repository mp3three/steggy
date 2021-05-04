import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { FormSchema, ProjectSchema, SubmissionSchema } from './schema';
import { ProjectService } from './services';

@Module({})
export class PersistenceModule {
  // #region Public Static Methods

  public static mongooseRoot(uri: string): DynamicModule {
    return MongooseModule.forRoot(uri, {
      useCreateIndex: true,
    });
  }

  public static registerMongoose(): DynamicModule {
    return {
      exports: [ProjectService],
      imports: [
        MongooseModule.forFeature([
          { name: SubmissionDTO.name, schema: SubmissionSchema },
          { name: FormDTO.name, schema: FormSchema },
          { name: ProjectDTO.name, schema: ProjectSchema },
        ]),
      ],
      module: PersistenceModule,
      providers: [ProjectService],
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
