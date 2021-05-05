import { FormioSdkModule } from '@automagical/formio-sdk';
import { PersistenceModule } from '@automagical/persistence';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { HasUserGuard } from './guards';
import { FetchUserdataMiddleware, LoadFormMiddleware } from './middleware';

const providers = [LoadFormMiddleware, FetchUserdataMiddleware, HasUserGuard];
@Module({
  exports: providers,
  imports: [PersistenceModule, FormioSdkModule, PassportModule],
  providers: providers,
})
export class ServerModule {}
