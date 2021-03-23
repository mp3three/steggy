import { Module } from '@nestjs/common';
import { HomeAssistantModule } from '@automagical/home-assistant';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [HomeAssistantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
