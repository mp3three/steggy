import { MongoPersistenceModule } from '@automagical/persistence';
import { LIB_CONTROLLER_LOGIC, LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  GroupDTO,
  GroupSchema,
  RoomDTO,
  RoomSchema,
  RoomStateDTO,
  RoomStateSchema,
} from '../contracts';
import { DatabaseConnectService, StatePersistenceService } from '../services';
import {
  GroupPersistenceService,
  RoomPersistenceService,
} from '../services/persistence';

@LibraryModule({
  exports: [
    DatabaseConnectService,
    GroupPersistenceService,
    RoomPersistenceService,
    StatePersistenceService,
  ],
  imports: [
    MongoPersistenceModule,
    MongooseModule.forFeature([
      { name: GroupDTO.name, schema: GroupSchema },
      { name: RoomDTO.name, schema: RoomSchema },
      { name: RoomStateDTO.name, schema: RoomStateSchema },
    ]),
  ],
  library: LIB_CONTROLLER_LOGIC,
  local: true,
  providers: [
    DatabaseConnectService,
    StatePersistenceService,
    GroupPersistenceService,
    RoomPersistenceService,
  ],
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
