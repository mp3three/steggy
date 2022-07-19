import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  GeneralSaveStateDTO,
  ROOM_ENTITY_EXTRAS,
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
  LightAttributesDTO,
} from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

import { LightManagerService } from '../lighting';

@Injectable()
export class EntityCommandRouterService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly light: LightManagerService,
    private readonly switchDomain: SwitchDomainService,
    private readonly media: MediaPlayerDomainService,
    private readonly fan: FanDomainService,
    private readonly lock: LockDomainService,
    private readonly climate: ClimateDomainService,
  ) {}

  public async fromState(
    { ref, state, extra }: GeneralSaveStateDTO,
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
      case 'light':
        await this.lightEntity(
          id,
          command as keyof LightManagerService,
          body as LightAttributesDTO,
          waitForChange,
        );
        return;
      case 'input_boolean':
      case 'switch':
        await this.switchEntity(
          id,
          command as keyof SwitchDomainService,
          waitForChange,
        );
        return;
      case 'media_player':
        await this.mediaEntity(
          id,
          command as keyof MediaPlayerDomainService,
          waitForChange,
        );
        return;
      case 'fan':
        await this.fanEntity(
          id,
          command as keyof FanDomainService,
          body as FanAttributesDTO,
          waitForChange,
        );
        return;
      case 'lock':
        await this.lockEntity(
          id,
          command as keyof LockDomainService,
          waitForChange,
        );
        return;
      case 'climate':
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
        return await this.climate.turnOff(id, waitForChange);
      case 'turnOn':
        return await this.climate.turnOn(id, waitForChange);
      case 'setFanMode':
        await this.climate.setFanMode(id, body.fan_mode, waitForChange);
        return;
      case 'setHvacMode':
        await this.climate.setHvacMode(id, body.hvac_mode, waitForChange);
        return;
      case 'setPresetMode':
        await this.climate.setPresetMode(id, body.preset_mode, waitForChange);
        return;
      case 'setTemperature':
        await this.climate.setTemperature(id, body, waitForChange);
        return;
      case 'setHumidity':
        await this.climate.setHumidity(
          id,
          body.current_humidity,
          waitForChange,
        );
        return;
      case 'setSwingMode':
        // 💃
        await this.climate.setSwingMode(id, body.swing_mode, waitForChange);
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
        return await this.fan.turnOff(id, waitForChange);
      case 'turnOn':
      case 'on':
        if (!percentage) {
          return await this.fan.turnOn(id, waitForChange);
        }
      // fall through
      case 'setSpeed':
      case 'setFanSpeed':
        if (is.number(percentage)) {
          return await this.fan.setPercentage(id, percentage, waitForChange);
        }
        if (is.string(speed)) {
          return await this.fan.setSpeed(id, speed, waitForChange);
        }
        return;
      case 'fanSpeedUp':
        return await this.fan.fanSpeedUp(id, waitForChange);
      case 'fanSpeedDown':
        return await this.fan.fanSpeedDown(id, waitForChange);
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
        return await this.light.circadianLight(id);
      case 'dimDown':
        return await this.light.dimDown({}, [id]);
      case 'dimUp':
        return await this.light.dimUp({}, [id]);
      case 'turnOff':
      case 'off':
        return await this.light.turnOff(id, waitForChange);
      case 'turnOn':
      case 'on':
        return await this.light.turnOn(id, { extra }, waitForChange);
    }
    throw new BadRequestException(command);
  }

  private async lockEntity(id: string, command: string, waitForChange = false) {
    switch (command) {
      case 'lock':
      case 'locked':
        return await this.lock.lock(id, waitForChange);
      case 'unlock':
      case 'unlocked':
        return await this.lock.unlock(id, waitForChange);
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
        return await this.media.turnOff(id, waitForChange);
      case 'turnOn':
      case 'on':
        return await this.media.turnOn(id, waitForChange);
      case 'playPause':
        return await this.media.playPause(id, waitForChange);
      case 'mute':
        return await this.media.mute(id, waitForChange);
      case 'volumeUp':
        return await this.media.volumeUp(id, waitForChange);
      case 'volumeDown':
        return await this.media.volumeDown(id, waitForChange);
      case 'toggle':
        return await this.media.toggle(id, waitForChange);
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
        return await this.switchDomain.toggle(id, waitForChange);
      case 'turnOn':
      case 'on':
        return await this.switchDomain.turnOn(id, waitForChange);
      case 'turnOff':
      case 'off':
        return await this.switchDomain.turnOff(id, waitForChange);
    }
    throw new BadRequestException(command);
  }
}
