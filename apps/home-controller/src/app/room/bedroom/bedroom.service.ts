import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EntityService } from '../../entity/entity.service';
import { SwitchEntity } from '../../entity/types/switch.entity';
import { RoomCode } from '../../enums/room-codes.enum';
import { PicoButtons } from '../../enums/room.enum';
import { HomeAssistantService } from '../../home-assistant/home-assistant.service';
import logger from '../../log';
import { RoomService } from '../room.service';
import { SceneRoom } from '../scene.room';
import cron = require('node-cron');

const { log, warn, debug, error, develop } = logger('BedroomService');

@Injectable()
export class BedroomService extends SceneRoom {
  private womp: SwitchEntity;

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
  ) {
    super(RoomCode.bedroom, {
      homeAssistantService,
      roomService,
      entityService,
    });
  }

  protected async init() {
    await super.init();
    this.wakeupLightAlarm();
    this.bedPico();
    this.womp = await this.entityService.byId('switch.womp');
  }

  private bedPico() {
    this.bindPico(
      'sensor.bed_pico',
      button => this.bedPicoCb(button),
      () => null,
    );
  }

  private async bedPicoCb(button) {
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
        warn(`wakeupLightAlarm step 2 disabled`);
        clearTimeout(timeout);
        timeout = null;
      }
    });
    cron.schedule('0 40 7 * * Mon,Tue,Wed,Thu,Fri', () => {
      log(`Wakeup Alarm`);
      this.exec({
        scene: 'medium',
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
}
