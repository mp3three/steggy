import { HomeAssistantCoreService } from '@automagical/home-assistant';
import {
  AutoLogService,
  ModuleScannerService,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

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
  ) {}

  @Trace()
  public async areaOn(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    const { lights, switches, accessories } = settings;
    await this.stateManager.removeFlag(settings, AUTO_STATE);

    const scope = this.commandScope(command);
    if (scope.has(RoomCommandScope.ABORT)) {
      return;
    }
    await this.lightManager.circadianLight(lights ?? [], 100);
    await this.hassCore.turnOn(switches ?? []);
    if (scope.has(RoomCommandScope.ACCESSORIES)) {
      await this.hassCore.turnOn(accessories ?? []);
    }
  }

  @Trace()
  public async areaOff(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    const { lights, switches, accessories } = settings;
    await this.stateManager.removeFlag(settings, AUTO_STATE);

    const scope = this.commandScope(command);
    if (scope.has(RoomCommandScope.ABORT)) {
      return;
    }

    if (!scope.has(RoomCommandScope.ABORT)) {
      await this.lightManager.turnOffEntities(lights ?? []);
      await this.hassCore.turnOff(switches ?? []);
      if (scope.has(RoomCommandScope.ACCESSORIES)) {
        await this.hassCore.turnOff(accessories ?? []);
      }
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
