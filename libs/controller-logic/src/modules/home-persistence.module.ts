import { MongoPersistenceModule } from '@automagical/persistence';
import { LIB_CONTROLLER_LOGIC, LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomStateDTO, RoomStateSchema } from '../contracts';
import { DatabaseConnectService, StatePersistenceService } from '../services';

@LibraryModule({
  exports: [DatabaseConnectService, StatePersistenceService],
  imports: [
    MongoPersistenceModule,
    MongooseModule.forFeature([
      { name: RoomStateDTO.name, schema: RoomStateSchema },
    ]),
  ],
  library: LIB_CONTROLLER_LOGIC,
  notGlobal: true,
  providers: [DatabaseConnectService, StatePersistenceService],
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
