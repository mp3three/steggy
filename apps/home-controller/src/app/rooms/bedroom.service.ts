import {
  EntityService,
  HomeAssistantService,
  PicoButtons,
  RoomCode,
  RoomScene,
  RoomService,
  SceneRoom,
  SwitchEntity,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { schedule } from 'node-cron';

@Injectable()
export class BedroomService extends SceneRoom {
  // #region Object Properties

  private readonly _logger = Logger(BedroomService);

  private womp: SwitchEntity;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
    protected readonly configService: ConfigService,
  ) {
    super(RoomCode.bedroom, {
      homeAssistantService,
      roomService,
      entityService,
      configService,
    });
  }

  // #endregion Constructors

  // #region Protected Methods

  protected async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    this.wakeupLightAlarm();
    this.bindPico('sensor.bed_pico', (button) => this.bedPicoCb(button));
    this.womp = await this.entityService.byId('switch.womp');
  }

  // #endregion Protected Methods

  // #region Private Methods

  private async bedPicoCb(button: PicoButtons) {
    switch (button) {
      case PicoButtons.on:
        return this.execGlobal({
          setDir: true,
          everything: true,
        });
      case PicoButtons.off:
        return this.execGlobal({
          setDir: false,
          everything: true,
        });
      case PicoButtons.favorite:
        return this.womp.toggle();
      case PicoButtons.down:
        return this.fan.speedDown();
      case PicoButtons.up:
        return this.fan.speedUp();
    }
  }

  private wakeupLightAlarm() {
    let timeout = null;
    this.on('roomModeChanged', () => {
      // Doesn't matter
      if (!timeout) {
        return;
      }
      if (this.roomMode === 'off') {
        this._logger.info(`wakeupLightAlarm step 2 disabled`);
        clearTimeout(timeout);
        timeout = null;
      }
    });
    schedule('0 40 7 * * Mon,Tue,Wed,Thu,Fri', () => {
      this._logger.info(`Wakeup Alarm`);
      this.exec({
        scene: RoomScene.medium,
      });
      timeout = setTimeout(() => {
        if (this.roomMode === 'off') {
          // Toggling womp doesn't return on purpose
          return;
        }
        timeout = null;
        this.smart();
      }, 1000 * 60 * 10);
    });
  }

  // #endregion Private Methods
}
