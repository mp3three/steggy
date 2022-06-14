/* eslint-disable @typescript-eslint/require-await */
import { MongooseModule } from '@nestjs/mongoose';
import { BootstrapOptions } from '@steggy/boilerplate';
import { ConnectService, MongoPersistenceModule } from '@steggy/persistence';

import { DEFAULT_CONFIG } from './default-config';

export const BOOTSTRAP_OPTIONS = async (): Promise<BootstrapOptions> => ({
  config: DEFAULT_CONFIG,
  http: true,
  imports: [
    MongooseModule.forRootAsync({
      imports: [MongoPersistenceModule],
      inject: [ConnectService],
      useFactory: async (connect: ConnectService) => await connect.build(),
    }),
  ],
  prettyLog: false,
});
