import { PERSISTENCE_CONFIG, PersistenceConfig } from '@automagical/config';
import { MONGO } from '@automagical/contracts/constants';
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
import { CacheModule, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { PinoLogger } from 'nestjs-pino';

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
  ActionItemPersistenceMongoService,
  ActionPersistenceMongoService,
  EncryptionService,
  FormPersistenceMongoService,
  ProjectPersistenceMongoService,
  RolePersistenceMongoService,
  SchemaPersistenceMongoService,
  SessionPersistenceMongoService,
  SubmissionPersistenceMongoService,
  TagPersistenceMongoService,
  TokenPersistenceMongoService,
} from './services';

const SchemaMap = new Map<string, ModelDefinition[]>(
  Object.entries({
    default: [
      { name: ActionItemDTO.name, schema: ActionItemSchema },
      { name: ActionDTO.name, schema: ActionSchema },
      { name: FormDTO.name, schema: FormSchema },
      { name: ProjectDTO.name, schema: ProjectSchema },
      { name: RoleDTO.name, schema: RoleSchema },
      { name: SessionDTO.name, schema: SessionSchema },
      { name: TagDTO.name, schema: TagSchema },
      { name: TokenDTO.name, schema: TokenSchema },
      { name: SchemaDTO.name, schema: SchemaSchema },
    ],
    submission: [{ name: SubmissionDTO.name, schema: SubmissionSchema }],
  }),
);

const services = [
  ActionItemPersistenceMongoService,
  ActionPersistenceMongoService,
  FormPersistenceMongoService,
  ProjectPersistenceMongoService,
  RolePersistenceMongoService,
  SchemaPersistenceMongoService,
  SessionPersistenceMongoService,
  SubmissionPersistenceMongoService,
  TagPersistenceMongoService,
  TokenPersistenceMongoService,
  EncryptionService,
];
export class PersistenceModule {
  // #region Public Static Methods

  public static forFeature(CRUD_WIRING: Provider[] = []): DynamicModule {
    const schemas: DynamicModule[] = [];
    SchemaMap.forEach((schemaList, connection) => {
      schemas.push(MongooseModule.forFeature(schemaList, connection));
    });
    return {
      exports: [...services, ...schemas],
      global: true,
      imports: [...schemas, CacheModule.register()],
      module: PersistenceModule,
      providers: [...services, ...CRUD_WIRING],
    };
  }

  /**
   * This function is reponsible for setting up the multi connect functionality
   *
   * This currently can be divided up as far as by collection.
   * The default connection is derived from the MONGO config variable (same environment variable that 7.x uses).
   * Individual models can have their connection strings using the SchemaMap (hard coded above)
   *
   * If a model does not have an override defined in the config, it will use the default connection
   */
  public static forRoot(): DynamicModule[] {
    const out = [
      MongooseModule.forRootAsync({
        connectionName: 'default',
        inject: [ConfigService],
        useFactory(configService: ConfigService) {
          return {
            uri: configService.get(MONGO),
            useCreateIndex: true,
          };
        },
      }),
    ];
    SchemaMap.forEach((options, key) => {
      if (key === 'default') {
        return;
      }
      out.push(
        MongooseModule.forRootAsync({
          connectionName: key,
          inject: [ConfigService, PinoLogger],
          useFactory(configService: ConfigService, logger: PinoLogger) {
            const config =
              configService.get<PersistenceConfig>(PERSISTENCE_CONFIG);
            const configMap = new Map(Object.entries(config.connections ?? {}));
            if (!configMap.has(key)) {
              logger.warn(
                {
                  context: PersistenceModule.name,
                },
                `Using default config for connection {${key}}`,
              );
              return {
                uri: configService.get(MONGO),
                useCreateIndex: true,
              };
            }
            return {
              useCreateIndex: true,
              ...configMap.get(key),
            };
          },
        }),
      );
    });
    return out;
  }

  // #endregion Public Static Methods
}
