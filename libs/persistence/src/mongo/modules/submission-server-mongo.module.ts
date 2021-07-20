import {
  FormDTO,
  ProjectDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
import { MinimalSdkModule } from '@automagical/formio-sdk';
import { CacheModule, DynamicModule, Global, Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';

import { EncryptionService } from '../../services';
import { FormSchema, ProjectSchema, SubmissionSchema } from '../schema';
import {
  FormPersistenceMongoService,
  ProjectPersistenceMongoService,
  SubmissionPersistenceMongoService,
} from '../services';

// const schemas = MongooseModule.forFeature([
//   { name: ActionItemDTO.name, schema: ActionItemSchema },
//   { name: ActionDTO.name, schema: ActionSchema },
//   { name: FormDTO.name, schema: FormSchema },
//   { name: ProjectDTO.name, schema: ProjectSchema },
//   { name: RoleDTO.name, schema: RoleSchema },
//   { name: SessionDTO.name, schema: SessionSchema },
//   { name: TagDTO.name, schema: TagSchema },
//   { name: TokenDTO.name, schema: TokenSchema },
//   { name: SchemaDTO.name, schema: SchemaSchema },
//   { name: SubmissionDTO.name, schema: SubmissionSchema },
// ]);
const SchemaMap = new Map<string, ModelDefinition[]>(
  Object.entries({
    default: [
      { name: FormDTO.name, schema: FormSchema },
      { name: ProjectDTO.name, schema: ProjectSchema },
      { name: SubmissionDTO.name, schema: SubmissionSchema },
    ],
    submission: [],
  }),
);
const schemas: DynamicModule[] = [];
SchemaMap.forEach((schemaList, connection) => {
  schemas.push(MongooseModule.forFeature(schemaList, connection));
});
const services = [
  FormPersistenceMongoService,
  ProjectPersistenceMongoService,
  SubmissionPersistenceMongoService,
  EncryptionService,
];
@Global()
@Module({
  exports: [...services, ...schemas],
  imports: [...schemas, CacheModule.register(), MinimalSdkModule],
  providers: [...services],
})
export class SubmissionServerMongoModule {
  // #region Public Static Methods

  public static forFeature(): DynamicModule {
    const schemas: DynamicModule[] = [];
    SchemaMap.forEach((schemaList, connection) => {
      schemas.push(MongooseModule.forFeature(schemaList, connection));
    });
    return {
      exports: [...services, ...schemas],
      global: true,
      imports: [...schemas, CacheModule.register(), MinimalSdkModule],
      module: SubmissionServerMongoModule,
      providers: [...services],
    };
  }

  // #endregion Public Static Methods
}
