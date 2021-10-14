import {
  ClimateDomainService,
  domain,
  FanDomainService,
  FanSpeeds,
  HASS_DOMAINS,
  LockDomainService,
  MediaPlayerDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { AutoLogService, Trace } from '@automagical/utilities';
import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';

import { LightManagerService } from './light-manager.service';

type FanBody = { speed: FanSpeeds };
type ClimateBody = {
  mode?: string;
  target_temp_high?: number;
  target_temp_low?: number;
  temperature?: number;
  value?: number;
};

@Injectable()
export class CommandRouterService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly lightService: LightManagerService,
    private readonly switchService: SwitchDomainService,
    private readonly mediaService: MediaPlayerDomainService,
    private readonly fanService: FanDomainService,
    private readonly lockService: LockDomainService,
    private readonly climateService: ClimateDomainService,
  ) {}

  @Trace()
  public async process(
    id: string,
    command: string,
    body: Record<string, unknown> = {},
  ): Promise<void> {
    switch (domain(id)) {
      case HASS_DOMAINS.light:
        await this.light(id, command as keyof LightManagerService);
        return;
      case HASS_DOMAINS.switch:
        await this.switch(id, command as keyof SwitchDomainService);
        return;
      case HASS_DOMAINS.media_player:
        await this.media(id, command as keyof MediaPlayerDomainService);
        return;
      case HASS_DOMAINS.fan:
        await this.fan(id, command as keyof FanDomainService, body as FanBody);
        return;
      case HASS_DOMAINS.lock:
        await this.lock(id, command as keyof LockDomainService);
        return;
      case HASS_DOMAINS.climate:
        await this.climate(
          id,
          command as keyof ClimateDomainService,
          body as ClimateBody,
        );
        return;
    }
    throw new NotImplementedException();
  }

  private async climate(
    id: string,
    command: keyof ClimateDomainService,
    body: ClimateBody = {},
  ): Promise<void> {
    switch (command) {
      case 'turnOff':
        return await this.climateService.turnOff(id);
      case 'turnOn':
        return await this.climateService.turnOn(id);
      case 'setFanMode':
        await this.climateService.setFanMode(id, body.mode);
        return;
      case 'setHvacMode':
        await this.climateService.setHvacMode(id, body.mode);
        return;
      case 'setPresetMode':
        await this.climateService.setPresetMode(id, body.mode);
        return;
      case 'setTemperature':
        await this.climateService.setTemperature(id, body);
        return;
      case 'setHumidity':
        await this.climateService.setHumidity(id, body.value);
        return;
      case 'setSwingMode':
        await this.climateService.setSwingMode(id, body.mode);
        return;
    }
  }

  @Trace()
  private async fan(
    id: string,
    command: keyof FanDomainService,
    { speed }: FanBody,
  ): Promise<void> {
    switch (command) {
      case 'turnOff':
        return await this.fanService.turnOff(id);
      case 'turnOn':
        return await this.fanService.turnOn(id);
      case 'fanSpeedUp':
        return await this.fanService.fanSpeedUp(id);
      case 'fanSpeedDown':
        return await this.fanService.fanSpeedDown(id);
      case 'setSpeed':
        if (!speed || !FanSpeeds[speed]) {
          throw new BadRequestException(`Provide a valid fan speed`);
        }
        return await this.fanService.setSpeed(id, speed);
    }
    throw new BadRequestException();
  }

  @Trace()
  private async light(id: string, command: keyof LightManagerService) {
    switch (command) {
      case 'circadianLight':
        return await this.lightService.circadianLight(id);
      case 'dimDown':
        return await this.lightService.dimDown({}, [id]);
      case 'dimUp':
        return await this.lightService.dimUp({}, [id]);
      case 'turnOff':
        return await this.lightService.turnOff(id);
      case 'turnOn':
        return await this.lightService.turnOn(id);
    }
    throw new BadRequestException();
  }

  @Trace()
  private async lock(id: string, command: keyof LockDomainService) {
    switch (command) {
      case 'lock':
        return await this.lockService.lock(id);
      case 'unlock':
        return await this.lockService.unlock(id);
    }
    throw new BadRequestException();
  }

  @Trace()
  private async media(
    id: string,
    command: keyof MediaPlayerDomainService,
  ): Promise<void> {
    switch (command) {
      case 'turnOff':
        return await this.mediaService.turnOff(id);
      case 'turnOn':
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
    throw new BadRequestException();
  }

  @Trace()
  private async switch(
    id: string,
    command: keyof SwitchDomainService,
  ): Promise<void> {
    switch (command) {
      case 'toggle':
        return await this.switchService.toggle(id);
      case 'turnOn':
        return await this.switchService.turnOn(id);
      case 'turnOff':
        return await this.switchService.turnOff(id);
    }
    throw new BadRequestException();
  }
}
