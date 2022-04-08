import { AutoLogService } from '@steggy/boilerplate';
import {
  ROOM_ENTITY_EXTRAS,
  RoomEntitySaveStateDTO,
} from '@steggy/controller-shared';
import {
  ClimateDomainService,
  FanDomainService,
  LockDomainService,
  MediaPlayerDomainService,
  SwitchDomainService,
} from '@steggy/home-assistant';
import {
  ClimateAttributesDTO,
  domain,
  FanAttributesDTO,
  HASS_DOMAINS,
  LightAttributesDTO,
} from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';

import { LightManagerService } from './lighting';
import { MetadataService } from './metadata.service';

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
    private readonly metadataService: MetadataService,
  ) {}

  public async fromState(
    { ref, state, extra }: RoomEntitySaveStateDTO,
    waitForChange = false,
  ): Promise<void> {
    await this.process(ref, state, extra, waitForChange);
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
          body as LightAttributesDTO,
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
        await this.mediaEntity(
          id,
          command as keyof MediaPlayerDomainService,
          waitForChange,
        );
        return;
      case HASS_DOMAINS.fan:
        await this.fanEntity(
          id,
          command as keyof FanDomainService,
          body as FanAttributesDTO,
          waitForChange,
        );
        return;
      case HASS_DOMAINS.lock:
        await this.lockEntity(
          id,
          command as keyof LockDomainService,
          waitForChange,
        );
        return;
      case HASS_DOMAINS.climate:
        await this.climateEntity(
          id,
          command as keyof ClimateDomainService,
          body as ClimateAttributesDTO,
          waitForChange,
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
    waitForChange = false,
  ): Promise<void> {
    switch (command) {
      case 'turnOff':
        return await this.climateService.turnOff(id, waitForChange);
      case 'turnOn':
        return await this.climateService.turnOn(id, waitForChange);
      case 'setFanMode':
        await this.climateService.setFanMode(id, body.fan_mode, waitForChange);
        return;
      case 'setHvacMode':
        await this.climateService.setHvacMode(
          id,
          body.hvac_mode,
          waitForChange,
        );
        return;
      case 'setPresetMode':
        await this.climateService.setPresetMode(
          id,
          body.preset_mode,
          waitForChange,
        );
        return;
      case 'setTemperature':
        await this.climateService.setTemperature(id, body, waitForChange);
        return;
      case 'setHumidity':
        await this.climateService.setHumidity(
          id,
          body.current_humidity,
          waitForChange,
        );
        return;
      case 'setSwingMode':
        // 💃
        await this.climateService.setSwingMode(
          id,
          body.swing_mode,
          waitForChange,
        );
        return;
    }
  }

  private async fanEntity(
    id: string,
    command: string,
    { percentage, speed }: FanAttributesDTO,
    waitForChange = false,
  ): Promise<void> {
    //
    switch (command) {
      case 'turnOff':
      case 'off':
        return await this.fanService.turnOff(id, waitForChange);
      case 'turnOn':
      case 'on':
        if (!percentage) {
          return await this.fanService.turnOn(id, waitForChange);
        }
      // fall through
      case 'setSpeed':
      case 'setFanSpeed':
        if (is.number(percentage)) {
          return await this.fanService.setPercentage(
            id,
            percentage,
            waitForChange,
          );
        }
        if (is.string(speed)) {
          return await this.fanService.setSpeed(id, speed, waitForChange);
        }
        return;
      case 'fanSpeedUp':
        return await this.fanService.fanSpeedUp(id, waitForChange);
      case 'fanSpeedDown':
        return await this.fanService.fanSpeedDown(id, waitForChange);
    }
    throw new BadRequestException(command);
  }

  private async lightEntity(
    id: string,
    command: string,
    extra: LightAttributesDTO,
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
        return await this.lightService.turnOn(id, { extra }, waitForChange);
    }
    throw new BadRequestException(command);
  }

  private async lockEntity(id: string, command: string, waitForChange = false) {
    switch (command) {
      case 'lock':
      case 'locked':
        return await this.lockService.lock(id, waitForChange);
      case 'unlock':
      case 'unlocked':
        return await this.lockService.unlock(id, waitForChange);
    }
    throw new BadRequestException(command);
  }

  private async mediaEntity(
    id: string,
    command: string,
    waitForChange = false,
  ): Promise<void> {
    switch (command) {
      case 'turnOff':
      case 'off':
        return await this.mediaService.turnOff(id, waitForChange);
      case 'turnOn':
      case 'on':
        return await this.mediaService.turnOn(id, waitForChange);
      case 'playPause':
        return await this.mediaService.playPause(id, waitForChange);
      case 'mute':
        return await this.mediaService.mute(id, waitForChange);
      case 'volumeUp':
        return await this.mediaService.volumeUp(id, waitForChange);
      case 'volumeDown':
        return await this.mediaService.volumeDown(id, waitForChange);
      case 'toggle':
        return await this.mediaService.toggle(id, waitForChange);
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
