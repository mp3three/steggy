import { Module, Global } from '@nestjs/common';
import { HomeAssistantService } from './home-assistant.service';

@Global()
@Module({
  controllers: [],
  providers: [HomeAssistantService],
  exports: [HomeAssistantService],
})
export class HomeAssistantModule {}
