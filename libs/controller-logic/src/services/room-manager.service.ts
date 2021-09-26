import {
  HomeAssistantCoreService,
  RemoteDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  InjectConfig,
  ModuleScannerService,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { MAX_BRIGHTNESS } from '../config';
import {
  iRoomController,
  ROOM_CONTROLLER_SETTINGS,
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerSettingsDTO,
} from '../contracts';
import { LightManagerService } from './light-manager.service';
import { StateManagerService } from './state-manager.service';

const AUTO_STATE = 'AUTO_STATE';
@Injectable()
export class RoomManagerService {
  public controllers = new Map<string, iRoomController>();
  public settings = new Map<string, RoomControllerSettingsDTO>();

  constructor(
    private readonly logger: AutoLogService,
    private readonly lightManager: LightManagerService,
    private readonly stateManager: StateManagerService,
    private readonly scanner: ModuleScannerService,
    private readonly hassCore: HomeAssistantCoreService,
    private readonly remoteService: RemoteDomainService,
    @InjectConfig(MAX_BRIGHTNESS) private readonly maxBrightness: number,
  ) {}

  @Trace()
  public async areaOn(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    const { lights, switches, accessories, name } = settings;
    await this.stateManager.removeFlag(settings, AUTO_STATE);

    const scope = this.commandScope(command);
    await this.lightManager.circadianLight(lights ?? [], this.maxBrightness);
    await this.hassCore.turnOn(switches ?? []);
    if (scope.has(RoomCommandScope.ACCESSORIES)) {
      await this.hassCore.turnOn(accessories ?? []);
    }
    const instance = this.controllers.get(name);
    if (instance?.areaOn) {
      await instance.areaOn(command);
    }
  }

  @Trace()
  public async areaOff(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    const { lights, switches, accessories, name, media } = settings;
    await this.stateManager.removeFlag(settings, AUTO_STATE);

    const scope = this.commandScope(command);
    await this.lightManager.turnOffEntities(lights ?? []);
    await this.hassCore.turnOff(switches ?? []);
    if (scope.has(RoomCommandScope.ACCESSORIES)) {
      await this.hassCore.turnOff(accessories ?? []);
      if (media) {
        await this.remoteService.turnOff(media);
      }
    }
    const instance = this.controllers.get(name);
    if (instance?.areaOff) {
      await instance.areaOff(command);
    }
  }

  protected onModuleInit(): void {
    const settings = this.scanner.findWithSymbol<
      RoomControllerSettingsDTO,
      iRoomController
    >(ROOM_CONTROLLER_SETTINGS);
    settings.forEach((settings, instance) => {
      this.controllers.set(settings.name, instance);
      this.settings.set(settings.name, settings);
    });
  }

  protected commandScope(command?: RoomCommandDTO): Set<RoomCommandScope> {
    command ??= {};
    command.scope ??= [];
    command.scope = Array.isArray(command.scope)
      ? command.scope
      : [command.scope];
    return new Set(command.scope);
  }
}
