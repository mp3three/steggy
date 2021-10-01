import { LightManagerService } from '@automagical/controller-logic';
import {
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

@Injectable()
export class CommandRouter {
  constructor(
    private readonly logger: AutoLogService,
    private readonly lightService: LightManagerService,
    private readonly switchService: SwitchDomainService,
    private readonly mediaService: MediaPlayerDomainService,
    private readonly fanService: FanDomainService,
    private readonly lockService: LockDomainService,
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
        await this.fan(
          id,
          command as keyof FanDomainService,
          body as { speed: FanSpeeds },
        );
        return;
      case HASS_DOMAINS.lock:
        await this.lock(id, command as keyof LockDomainService);
        return;
    }
    throw new NotImplementedException();
  }

  @Trace()
  private async fan(
    id: string,
    command: keyof FanDomainService,
    { speed }: { speed: FanSpeeds },
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
      case 'setFan':
        if (!speed || !FanSpeeds[speed]) {
          throw new BadRequestException(`Provide a valid fan speed`);
        }
        return await this.fanService.setFan(id, speed);
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
