import { HomeAssistantModule } from '@automagical/home-assistant';
import { Module } from '@nestjs/common';
import { MqttService } from 'nest-mqtt';
import { AppService } from './app.service';
import { MqttClientService } from './mqtt-client.service';
import { BedroomService } from './rooms/bedroom.service';
import { GamesService } from './rooms/games.service';
import { GarageService } from './rooms/garage.service';
import { GuestService } from './rooms/guest.service';
import { LivingService } from './rooms/living.service';
import { LoftService } from './rooms/loft.service';

@Module({
  imports: [HomeAssistantModule],
  providers: [
    AppService,
    MqttClientService,
    BedroomService,
    GamesService,
    GarageService,
    GuestService,
    LivingService,
    LoftService,
    MqttService,
  ],
})
export class AppModule {}
