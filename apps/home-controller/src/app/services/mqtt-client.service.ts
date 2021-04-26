import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { AreaService } from '@automagical/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MqttService } from 'nest-mqtt';
import { PinoLogger } from 'nestjs-pino';
import { AppService } from './app.service';

@Injectable()
export class MqttClientService {
  // #region Constructors

  constructor(
    @Inject(MqttService) private readonly mqttService: MqttService,
    private readonly appService: AppService,
    private readonly roomService: AreaService,
    @InjectLogger(MqttClientService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    private readonly eventEmitterService: EventEmitter2,
  ) {}

  // #endregion Constructors
  // // #endregion Constructors

  // // #region Public Methods

  // @OnEvent([MQTT_PUBLISH])
  // public publishMessage(
  //   topic: string,
  //   body: string | Record<string, unknown> | Buffer,
  // ): void {
  //   this.mqttService.publish(topic, body);
  // }

  // @Subscribe('mobile/car_ac')
  // public async carAc(): Promise<void> {
  //   this.logger.info('mobile/car_ac');
  // }

  // @Subscribe('mobile/leave_home')
  // public async goodbye(): Promise<void> {
  //   this.logger.info('mobile/leave_home');
  //   this.eventEmitterService.emit(GLOBAL_OFF);
  //   this.appService.setLocks(HassServices.lock);
  // }

  // // @Subscribe('mobile/scene/living')
  // // public async livingRoomScene(): Promise<void> {
  // //   this.logger.info('mobile/scene/living');
  // //   this.livingRoomService.setFavoriteScene();
  // // }
  // @Subscribe('mobile/lock')
  // public async lockHouse(): Promise<void> {
  //   this.logger.info('mobile/lock');
  //   this.appService.setLocks(HassServices.lock);
  // }

  // // @Subscribe('mobile/scene/loft')
  // // public async loftScene(): Promise<void> {
  // //   this.logger.info('mobile/scene/loft');
  // //   this.loftService.setFavoriteScene();
  // // }

  // // @Subscribe('mobile/transfer_pump')
  // // public async toggleTransferPump(): Promise<void> {
  // //   this.logger.info('mobile/transfer_pump');
  // //   this.garageService.toggleTransferPump();
  // // }
  // @Subscribe('mobile/unlock')
  // public async unlockHouse(): Promise<void> {
  //   this.logger.info('mobile/unlock');
  //   this.appService.setLocks(HassServices.unlock);
  // }
}

// @Subscribe(['lovelace', 'scene', '*'])
// @Subscribe('lovelace/scene/loft')
// public async setLoftScene(
//   scene: RoomScene,
//   @Ctx() context: MqttContext,
// ): Promise<void> {
//   // Currently seems to be borked
//   this.logger.error(
//     'room/set-scene',
//     scene,
//     context.getTopic().split('/').pop(),
//   );
// }
