import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibraryModule } from '@text-based/boilerplate';
import {
  GroupDTO,
  GroupSchema,
  RoomDTO,
  RoomSchema,
  RoutineDTO,
  RoutineSchema,
} from '@text-based/controller-shared';
import { MongoPersistenceModule } from '@text-based/persistence';

import { LIB_CONTROLLER_LOGIC } from '../config';
import { DatabaseConnectService } from '../services';
import {
  GroupPersistenceService,
  RoomPersistenceService,
  RoutinePersistenceService,
} from '../services/persistence';

const services = [
  DatabaseConnectService,
  GroupPersistenceService,
  RoutinePersistenceService,
  RoomPersistenceService,
];

@LibraryModule({
  exports: services,
  imports: [
    MongoPersistenceModule,
    MongooseModule.forFeature([
      { name: GroupDTO.name, schema: GroupSchema },
      { name: RoomDTO.name, schema: RoomSchema },
      { name: RoutineDTO.name, schema: RoutineSchema },
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
