import { MongoPersistenceModule } from '@automagical/persistence';
import { LIB_CONTROLLER_LOGIC, LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseConnectService } from '../services/database-connect.service';

@LibraryModule({
  exports: [DatabaseConnectService],
  imports: [MongoPersistenceModule],
  library: LIB_CONTROLLER_LOGIC,
  notGlobal: true,
  providers: [DatabaseConnectService],
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
