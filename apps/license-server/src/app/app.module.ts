import { LicensesModule } from '@automagical/licenses';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LicenseController } from './license.controller';

@Module({
  imports: [LicensesModule],
  controllers: [AppController, LicenseController],
})
export class AppModule {}
