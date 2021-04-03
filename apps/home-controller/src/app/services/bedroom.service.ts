import { HA_RAW_EVENT } from '@automagical/contracts/event-emitter';
import {
  HassEventDTO,
  HomeAssistantRoomConfigDTO,
  PicoButtons,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BedroomService {
  // #region Object Properties

  private readonly logger = Logger(BedroomService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly homeAssistantService: HomeAssistantService,
    private readonly roomService: RoomService,
    private readonly entityService: EntityService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected async bindPico(
    entityId: string,
    singleClick: (
      button: PicoButtons,
      dblClick: (button: PicoButtons) => Promise<void>,
    ) => Promise<void>,
    dblClick: (button: PicoButtons) => Promise<void> = () => null,
  ): Promise<void> {
    const pico = await this.entityService.byId<SensorEntity>(entityId);
    pico.on('update', () => singleClick(pico.state, dblClick));
  }

  protected async onModuleInit(): Promise<void> {
    this.bindPico('sensor.bed_pico', (button) => this.bedPicoCb(button));
    this.womp = await this.entityService.byId('switch.womp');
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Cron('0 40 8 * * Mon,Tue,Wed,Thu,Fri')
  private wakeupLightAlarm() {
    this.logger.info(`Wakeup Alarm`);
    const config: HomeAssistantRoomConfigDTO = null;
    return this.roomService.setScene(RoomScene.high, config, true);
  }

  @OnEvent('entity.bed_pico/update')
  private async bedPicoCb(event: HassEventDTO) {
    const button = event.data.new_state as PicoButtons;
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

  // #endregion Private Methods
}
