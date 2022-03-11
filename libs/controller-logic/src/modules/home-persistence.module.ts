import { LibraryModule } from '@automagical/boilerplate';
import {
  GroupDTO,
  GroupSchema,
  MetadataDTO,
  MetadataSchema,
  RoomDTO,
  RoomSchema,
  RoutineDTO,
  RoutineSchema,
} from '@automagical/controller-shared';
import { MongoPersistenceModule } from '@automagical/persistence';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LIB_CONTROLLER_LOGIC } from '../config';
import { DatabaseConnectService } from '../services';
import {
  GroupPersistenceService,
  MetadataPersistenceService,
  RoomPersistenceService,
  RoutinePersistenceService,
} from '../services/persistence';

const services = [
  DatabaseConnectService,
  GroupPersistenceService,
  RoutinePersistenceService,
  RoomPersistenceService,
  MetadataPersistenceService,
];

@LibraryModule({
  exports: services,
  imports: [
    MongoPersistenceModule,
    MongooseModule.forFeature([
      { name: GroupDTO.name, schema: GroupSchema },
      { name: RoomDTO.name, schema: RoomSchema },
      { name: RoutineDTO.name, schema: RoutineSchema },
      { name: MetadataDTO.name, schema: MetadataSchema },
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
