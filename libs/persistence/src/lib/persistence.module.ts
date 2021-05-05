import {
  ActionDTO,
  ActionItemDTO,
  FormDTO,
  ProjectDTO,
  RoleDTO,
  SchemaDTO,
  SessionDTO,
  SubmissionDTO,
  TagDTO,
  TokenDTO,
} from '@automagical/contracts/formio-sdk';
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import {
  ActionItemSchema,
  ActionSchema,
  FormSchema,
  ProjectSchema,
  RoleSchema,
  SchemaSchema,
  SessionSchema,
  SubmissionSchema,
  TagSchema,
  TokenSchema,
} from './schema';
import {
  ActionItemService,
  ActionService,
  FormService,
  ProjectService,
  RoleService,
  SchemaService,
  SessionService,
  SubmissionService,
  TagService,
  TokenService,
} from './services';

@Module({})
export class PersistenceModule {
  // #region Public Static Methods

  public static mongooseRoot(uri: string): DynamicModule {
    return MongooseModule.forRoot(uri, {
      useCreateIndex: true,
    });
  }

  public static registerMongoose(): DynamicModule {
    const services = [
      ActionItemService,
      ActionService,
      FormService,
      ProjectService,
      RoleService,
      SchemaService,
      SessionService,
      SubmissionService,
      TagService,
      TokenService,
    ];
    return {
      exports: services,
      imports: [
        MongooseModule.forFeature([
          { name: ActionItemDTO.name, schema: ActionItemSchema },
          { name: ActionDTO.name, schema: ActionSchema },
          { name: FormDTO.name, schema: FormSchema },
          { name: ProjectDTO.name, schema: ProjectSchema },
          { name: RoleDTO.name, schema: RoleSchema },
          { name: SchemaDTO.name, schema: SchemaSchema },
          { name: SessionDTO.name, schema: SessionSchema },
          { name: SubmissionDTO.name, schema: SubmissionSchema },
          { name: TagDTO.name, schema: TagSchema },
          { name: TokenDTO.name, schema: TokenSchema },
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
