import { HomeAssistantModule } from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Module } from '@nestjs/common';
import { MqttModule } from 'nest-mqtt';
import { AppService } from './app.service';
import { MqttClientService } from './mqtt-client.service';
import { BedroomService } from './rooms/bedroom.service';
import { GamesService } from './rooms/games.service';
import { GarageService } from './rooms/garage.service';
import { GuestService } from './rooms/guest.service';
import { LivingService } from './rooms/living.service';
import { LoftService } from './rooms/loft.service';

@Module({
  imports: [
    HomeAssistantModule,
    MqttModule.forRoot({
      host: process.env.MQTT_HOST,
      port: Number(process.env.MQTT_PORT),
      logger: {
        useValue: Logger.forNest('nest-mqtt'),
      },
    }),
  ],
  providers: [
    AppService,
    MqttClientService,
    BedroomService,
    GamesService,
    GarageService,
    GuestService,
    LivingService,
    LoftService,
    MqttClientService,
  ],
})
export class AppModule {}
