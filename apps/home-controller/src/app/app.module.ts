import { ConfigModule } from '@automagical/config';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Module } from '@nestjs/common';
import { MqttModule, MqttModuleAsyncOptions } from 'nest-mqtt';
import { environment } from '../environments/environment';
import { ApplicationConfig } from '../typings/';
import { PhoneController } from './controllers/phone.controller';
import { BedroomService } from './rooms/bedroom.service';
import { GamesService } from './rooms/games.service';
import { GarageService } from './rooms/garage.service';
import { GuestService } from './rooms/guest.service';
import { LivingService } from './rooms/living.service';
import { LoftService } from './rooms/loft.service';
import { AppService } from './services/app.service';
import { MqttClientService } from './services/mqtt-client.service';
import { PhoneService } from './services/phone.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.register<ApplicationConfig>({
      application: environment,
    }),
    HomeAssistantModule,
    MqttModule.forRootAsync({
      useFactory: async () => {
        const config = await ConfigModule.getConfig<ApplicationConfig>();
        return {
          host: config.application.MQTT_HOST,
          port: config.application.MQTT_PORT,
          logger: {
            useValue: Logger.forNest('nest-mqtt'),
          },
        } as MqttModuleAsyncOptions;
      },
    }),
  ],
  providers: [
    AppService,
    BedroomService,
    GamesService,
    GarageService,
    GuestService,
    LivingService,
    LoftService,
    MqttClientService,
    PhoneService,
  ],
  controllers: [PhoneController],
})
export class AppModule {}
