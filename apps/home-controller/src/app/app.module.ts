import { ConfigModule } from '@automagical/config';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { Module } from '@nestjs/common';
import { environment } from '../environments/environment';
import { ApplicationConfig } from '../typings/';
import { PhoneController } from './controllers/phone.controller';
// import { MqttClientService } from './mqtt-client.service';
import { BedroomService } from './rooms/bedroom.service';
import { GamesService } from './rooms/games.service';
import { GarageService } from './rooms/garage.service';
import { GuestService } from './rooms/guest.service';
import { LivingService } from './rooms/living.service';
import { LoftService } from './rooms/loft.service';
import { AppService } from './services/app.service';
import { PhoneService } from './services/phone.service';

@Module({
  imports: [
    ConfigModule.register<ApplicationConfig>({
      application: environment,
    }),
    HomeAssistantModule,
    // MqttModule.forRootAsync({
    //   useFactory: async () => {
    //     const config = await ConfigModule.getConfig<ApplicationConfig>();
    //     return {
    //       host: config.application.MQTT_HOST,
    //       port: config.application.MQTT_PORT,
    //       logger: {
    //         useValue: Logger.forNest('nest-mqtt'),
    //       },
    //     } as MqttModuleAsyncOptions;
    //   },
    // }),
  ],
  providers: [
    AppService,
    // MqttClientService,
    BedroomService,
    GamesService,
    GarageService,
    GuestService,
    LivingService,
    PhoneService,
    LoftService,
    // MqttClientService,
  ],
  controllers: [PhoneController],
})
export class AppModule {}
