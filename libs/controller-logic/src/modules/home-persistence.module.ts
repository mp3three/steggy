import { LibraryModule } from '@automagical/boilerplate';
import {
  EntityMetadataDTO,
  EntityMetadataSchema,
  GroupDTO,
  GroupSchema,
  RoomDTO,
  RoomSchema,
  RoutineDTO,
  RoutineSchema,
} from '@automagical/controller-shared';
import { MongoPersistenceModule } from '@automagical/persistence';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LIB_CONTROLLER_LOGIC } from '../config';
import { ServerMetadataDTO, ServerMetadataSchema } from '../contracts';
import { DatabaseConnectService } from '../services';
import {
  EntityMetadataPersistenceService,
  GroupPersistenceService,
  RoomPersistenceService,
  RoutinePersistenceService,
  ServerMetadataPersistenceService,
} from '../services/persistence';

const services = [
  DatabaseConnectService,
  GroupPersistenceService,
  RoutinePersistenceService,
  RoomPersistenceService,
  EntityMetadataPersistenceService,
  ServerMetadataPersistenceService,
];

@LibraryModule({
  exports: services,
  imports: [
    MongoPersistenceModule,
    MongooseModule.forFeature([
      { name: GroupDTO.name, schema: GroupSchema },
      { name: RoomDTO.name, schema: RoomSchema },
      { name: RoutineDTO.name, schema: RoutineSchema },
      { name: EntityMetadataDTO.name, schema: EntityMetadataSchema },
      { name: ServerMetadataDTO.name, schema: ServerMetadataSchema },
    ]),
  ],
  library: LIB_CONTROLLER_LOGIC,
  local: true,
  providers: services,
})
export class HomePersistenceModule {
  public static forRoot(): DynamicModule {
    return MongooseModule.forRootAsync({
      imports: [MongoPersistenceModule, HomePersistenceModule],
      inject: [DatabaseConnectService],
      async useFactory(connect: DatabaseConnectService) {
        return await connect.build();
      },
    });
  }
}
