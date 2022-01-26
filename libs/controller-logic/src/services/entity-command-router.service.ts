import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';
import type {
  ROOM_ENTITY_EXTRAS,
  RoomEntitySaveStateDTO,
} from '@text-based/controller-shared';
import {
  ClimateDomainService,
  FanDomainService,
  HomeAssistantFetchAPIService,
  LockDomainService,
  MediaPlayerDomainService,
  SwitchDomainService,
} from '@text-based/home-assistant';
import {
  ClimateAttributesDTO,
  domain,
  FanAttributesDTO,
  FanSpeeds,
  HASS_DOMAINS,
} from '@text-based/home-assistant-shared';

import { LightManagerService } from './lighting';

@Injectable()
export class EntityCommandRouterService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly lightService: LightManagerService,
    private readonly switchService: SwitchDomainService,
    private readonly mediaService: MediaPlayerDomainService,
    private readonly fanService: FanDomainService,
    private readonly lockService: LockDomainService,
    private readonly climateService: ClimateDomainService,
    private readonly fetchAPI: HomeAssistantFetchAPIService,
  ) {}

  public async fromState({
    ref,
    state,
    extra,
  }: RoomEntitySaveStateDTO): Promise<void> {
    await this.process(ref, state, extra);
  }

  public async history(): Promise<void> {
    //
  }

  public async process(
    id: string,
    command: string,
    body: ROOM_ENTITY_EXTRAS = {},
    waitForChange = false,
  ): Promise<void> {
    switch (domain(id)) {
      case HASS_DOMAINS.light:
        await this.lightEntity(
          id,
          command as keyof LightManagerService,
          waitForChange,
        );
        return;
      case HASS_DOMAINS.switch:
        await this.switchEntity(
          id,
          command as keyof SwitchDomainService,
          waitForChange,
        );
        return;
      case HASS_DOMAINS.media_player:
        await this.mediaEntity(id, command as keyof MediaPlayerDomainService);
        return;
      case HASS_DOMAINS.fan:
        await this.fanEntity(
          id,
          command as keyof FanDomainService,
          body as FanAttributesDTO,
        );
        return;
      case HASS_DOMAINS.lock:
        await this.lockEntity(id, command as keyof LockDomainService);
        return;
      case HASS_DOMAINS.climate:
        await this.climateEntity(
          id,
          command as keyof ClimateDomainService,
          body as ClimateAttributesDTO,
        );
        return;
    }
    this.logger.error({ id }, `Not implemented domain`);
    throw new NotImplementedException();
  }

  private async climateEntity(
    id: string,
    command: keyof ClimateDomainService,
    body: Partial<ClimateAttributesDTO> = {},
  ): Promise<void> {
    switch (command) {
      case 'turnOff':
        return await this.climateService.turnOff(id);
      case 'turnOn':
        return await this.climateService.turnOn(id);
      case 'setFanMode':
        await this.climateService.setFanMode(id, body.fan_mode);
        return;
      case 'setHvacMode':
        await this.climateService.setHvacMode(id, body.hvac_mode);
        return;
      case 'setPresetMode':
        await this.climateService.setPresetMode(id, body.preset_mode);
        return;
      case 'setTemperature':
        await this.climateService.setTemperature(id, body);
        return;
      case 'setHumidity':
        await this.climateService.setHumidity(id, body.current_humidity);
        return;
      case 'setSwingMode':
        // 💃
        await this.climateService.setSwingMode(id, body.swing_mode);
        return;
    }
  }

  private async fanEntity(
    id: string,
    command: string,
    { speed }: FanAttributesDTO,
  ): Promise<void> {
    switch (command) {
      case 'turnOff':
      case 'off':
        return await this.fanService.turnOff(id);
      case 'turnOn':
      case 'on':
        if (!speed) {
          return await this.fanService.turnOn(id);
        }
      // fall through
      case 'setSpeed':
        if (
          !speed ||
          ![...Object.values(FanSpeeds), 'fanSpeedUp', 'fanSpeedDown'].includes(
            speed,
          )
        ) {
          throw new BadRequestException(`Provide a valid fan speed`);
        }
        return await this.fanService.setSpeed(id, speed as FanSpeeds);
      case 'fanSpeedUp':
        return await this.fanService.fanSpeedUp(id);
      case 'fanSpeedDown':
        return await this.fanService.fanSpeedDown(id);
    }
    throw new BadRequestException(command);
  }

  private async lightEntity(
    id: string,
    command: string,
    waitForChange = false,
  ) {
    switch (command) {
      case 'circadianLight':
        return await this.lightService.circadianLight(id);
      case 'dimDown':
        return await this.lightService.dimDown({}, [id]);
      case 'dimUp':
        return await this.lightService.dimUp({}, [id]);
      case 'turnOff':
      case 'off':
        return await this.lightService.turnOff(id, waitForChange);
      case 'turnOn':
      case 'on':
        return await this.lightService.turnOn(id, undefined, waitForChange);
    }
    throw new BadRequestException(command);
  }

  private async lockEntity(id: string, command: string) {
    switch (command) {
      case 'lock':
      case 'locked':
        return await this.lockService.lock(id);
      case 'unlock':
      case 'unlocked':
        return await this.lockService.unlock(id);
    }
    throw new BadRequestException(command);
  }

  private async mediaEntity(id: string, command: string): Promise<void> {
    switch (command) {
      case 'turnOff':
      case 'off':
        return await this.mediaService.turnOff(id);
      case 'turnOn':
      case 'on':
        return await this.mediaService.turnOn(id);
      case 'playPause':
        return await this.mediaService.playPause(id);
      case 'mute':
        return await this.mediaService.mute(id);
      case 'volumeUp':
        return await this.mediaService.volumeUp(id);
      case 'volumeDown':
        return await this.mediaService.volumeDown(id);
      case 'toggle':
        return await this.mediaService.toggle(id);
    }
    throw new BadRequestException(command);
  }

  private async switchEntity(
    id: string,
    command: string,
    waitForChange = false,
  ): Promise<void> {
    switch (command) {
      case 'toggle':
        return await this.switchService.toggle(id, waitForChange);
      case 'turnOn':
      case 'on':
        return await this.switchService.turnOn(id, waitForChange);
      case 'turnOff':
      case 'off':
        return await this.switchService.turnOff(id, waitForChange);
    }
    throw new BadRequestException(command);
  }
}
