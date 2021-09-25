import { MongoPersistenceModule } from '@automagical/persistence';
import { LIB_CONTROLLER_LOGIC, LibraryModule } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseConnectService } from '../services/database-connect.service';

@LibraryModule({
  library: LIB_CONTROLLER_LOGIC,
  providers: [DatabaseConnectService],
})
export class HomePersistenceModule {
  public static connectDB(): DynamicModule {
    return MongooseModule.forRootAsync({
      imports: [MongoPersistenceModule],
      inject: [DatabaseConnectService],
      async useFactory(connect: DatabaseConnectService) {
        return await connect.build();
      },
    });
  }
}
