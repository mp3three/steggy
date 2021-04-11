import { MQTT_PUBLISH } from '@automagical/contracts/constants';
import { HassServices, RoomScene } from '@automagical/contracts/home-assistant';
import { RoomService } from '@automagical/home-assistant';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Ctx, MqttContext } from '@nestjs/microservices';
import { MqttService, Subscribe } from 'nest-mqtt';
import { AppService } from './app.service';
import { GarageService } from './garage.service';
import { LivingService } from './living.service';
import { LoftService } from './loft.service';

@Injectable()
export class MqttClientService {
  // #region Constructors

  constructor(
    @Inject(MqttService) private readonly mqttService: MqttService,
    private readonly appService: AppService,
    private readonly roomService: RoomService,
    @InjectPinoLogger(MqttClientService.name)
    protected readonly logger: PinoLogger,
    private readonly eventEmitterService: EventEmitter2,
    private readonly livingRoomService: LivingService,
    private readonly loftService: LoftService,
    private readonly garageService: GarageService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @OnEvent(MQTT_PUBLISH)
  public publishMessage(
    topic: string,
    body: string | Record<string, unknown> | Buffer,
  ): void {
    this.mqttService.publish(topic, body);
  }

  @Subscribe('mobile/car_ac')
  public async carAc(): Promise<void> {
    this.logger.info('mobile/car_ac');
  }

  @Subscribe('mobile/leave_home')
  public async goodbye(): Promise<void> {
    this.logger.info('mobile/leave_home');
    this.roomService.smart(null, RoomScene.off);
    this.appService.setLocks(HassServices.lock);
  }

  @Subscribe('mobile/scene/living')
  public async livingRoomScene(): Promise<void> {
    this.logger.info('mobile/scene/living');
    this.livingRoomService.sceneSmart();
  }

  @Subscribe('mobile/lock')
  public async lockHouse(): Promise<void> {
    this.logger.info('mobile/lock');
    this.appService.setLocks(HassServices.lock);
  }

  @Subscribe('mobile/scene/loft')
  public async loftScene(): Promise<void> {
    this.logger.info('mobile/scene/loft');
    this.loftService.sceneSmart();
  }

  @Subscribe('mobile/transfer_pump')
  public async toggleTransferPump(): Promise<void> {
    this.logger.info('mobile/transfer_pump');
    this.garageService.toggleTransferPump();
  }

  @Subscribe('mobile/unlock')
  public async unlockHouse(): Promise<void> {
    this.logger.info('mobile/unlock');
    this.appService.setLocks(HassServices.unlock);
  }

  @Subscribe(['lovelace', 'scene', '*'])
  @Subscribe('lovelace/scene/loft')
  public async setLoftScene(
    scene: RoomScene,
    @Ctx() context: MqttContext,
  ): Promise<void> {
    // Currently seems to be borked
    this.logger.error(
      'room/set-scene',
      scene,
      context.getTopic().split('/').pop(),
    );
  }

  // #endregion Public Methods
}
