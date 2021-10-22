import { MongoPersistenceModule } from '@automagical/persistence';
import { LIB_CONTROLLER_LOGIC, LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  GroupDTO,
  GroupSchema,
  RoomDTO,
  RoomSchema,
  SaveStateDTO,
  SaveStateSchema,
} from '../contracts';
import { DatabaseConnectService } from '../services';
import {
  GroupPersistenceService,
  RoomPersistenceService,
  SaveStatePersistenceService,
} from '../services/persistence';

const services = [
  DatabaseConnectService,
  GroupPersistenceService,
  SaveStatePersistenceService,
  RoomPersistenceService,
];

@LibraryModule({
  exports: services,
  imports: [
    MongoPersistenceModule,
    MongooseModule.forFeature([
      { name: GroupDTO.name, schema: GroupSchema },
      { name: RoomDTO.name, schema: RoomSchema },
      { name: SaveStateDTO.name, schema: SaveStateSchema },
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
