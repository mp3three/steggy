import { DynamicModule, Type } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

import { ConnectService } from '../services';
import { MongoPersistenceModule } from './mongo-persistence.module';

export class QuickConnectModule {
  public static forRoot(definitions: Type[]): DynamicModule[] {
    return [
      MongooseModule.forFeature(
        definitions.map(i => ({
          name: i.name,
          schema: SchemaFactory.createForClass(i),
        })),
      ),
      MongooseModule.forRootAsync({
        imports: [MongoPersistenceModule],
        inject: [ConnectService],
        async useFactory(connect: ConnectService) {
          return await connect.build();
        },
      }),
    ];
  }
}
