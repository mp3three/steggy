import { MongoPersistenceModule } from '@automagical/persistence';
import { LIB_CONTROLLER_LOGIC, LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  GroupDTO,
  GroupSchema,
  ItemNoteDTO,
  ItemNoteSchema,
  RoomDTO,
  RoomSchema,
  RoomStateDTO,
  RoomStateSchema,
} from '../contracts';
import { DatabaseConnectService, StatePersistenceService } from '../services';
import {
  GroupPersistenceService,
  ItemNoteService,
  RoomPersistenceService,
} from '../services/persistence';

@LibraryModule({
  exports: [
    DatabaseConnectService,
    GroupPersistenceService,
    ItemNoteService,
    RoomPersistenceService,
    StatePersistenceService,
  ],
  imports: [
    MongoPersistenceModule,
    MongooseModule.forFeature([
      { name: GroupDTO.name, schema: GroupSchema },
      { name: ItemNoteDTO.name, schema: ItemNoteSchema },
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
    ItemNoteService,
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
