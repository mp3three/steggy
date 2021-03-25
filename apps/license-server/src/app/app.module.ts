import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LicenseController } from './license.controller';

@Module({
  imports: [],
  controllers: [AppController, LicenseController],
  providers: [AppService],
})
export class AppModule {}
