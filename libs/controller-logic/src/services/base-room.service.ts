import {
  FanDomainService,
  HomeAssistantCoreService,
} from '@automagical/home-assistant';
import { RouteInjector } from '@automagical/server';
import { AutoLogService, PEAT, Trace } from '@automagical/utilities';
import { INestApplication, Injectable } from '@nestjs/common';
import { eachSeries } from 'async';

import {
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerSettingsDTO,
} from '..';
import { KunamiCodeService, LightManagerService, StateManagerService } from '.';

const AUTO_STATE = 'AUTO_STATE';

@Injectable()
export class BaseRoomService {
  constructor(
    protected logger: AutoLogService,
    protected lightManager: LightManagerService,
    protected fanDomain: FanDomainService,
    protected kunamiService: KunamiCodeService,
    protected stateManager: StateManagerService,
    protected hassCore: HomeAssistantCoreService,
  ) {}

  @Trace()
  public async areaOn(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);

    const scope = this.commandScope(command);
    if (scope.has(RoomCommandScope.ABORT)) {
      return;
    }
    await this.lightManager.circadianLight(settings.lights ?? [], 100);
    await this.hassCore.turnOn(settings.switches ?? []);
    if (scope.has(RoomCommandScope.ACCESSORIES)) {
      await this.hassCore.turnOn(settings.accessories ?? []);
    }
  }

  @Trace()
  public async areaOff(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);

    const scope = this.commandScope(command);
    if (scope.has(RoomCommandScope.ABORT)) {
      return;
    }

    if (!scope.has(RoomCommandScope.ABORT)) {
      await this.lightManager.turnOffEntities(settings.lights ?? []);
      await this.hassCore.turnOff(settings.switches ?? []);
      if (scope.has(RoomCommandScope.ACCESSORIES)) {
        await this.hassCore.turnOff(settings.accessories ?? []);
      }
    }
  }

  @Trace()
  public async dimUp(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);

    if (!settings.lights) {
      this.logger.warn(
        `No registered lights for room ${settings.friendlyName}`,
      );
      return;
    }
    this.lightManager.dimUp(command, settings.lights);
  }

  @Trace()
  public async dimDown(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);

    if (!settings.lights) {
      this.logger.warn(
        `No registered lights for room ${settings.friendlyName}`,
      );
      return;
    }
    this.lightManager.dimDown(command, settings.lights);
  }

  @Trace()
  public async favorite(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    const scope = this.commandScope(command);
    if (scope.has(RoomCommandScope.ABORT)) {
      return;
    }
    await this.stateManager.addFlag(AUTO_STATE);
  }

  @Trace()
  public async fanUp(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    if (!settings.fan) {
      this.logger.warn(`No registered fan for room ${settings.friendlyName}`);
      return;
    }
    const increment = command.increment || 1;
    await eachSeries(PEAT(increment), async (count, callback) => {
      this.fanDomain.fanSpeedUp(settings.fan);
      callback();
    });
  }

  @Trace()
  public async fanDown(
    settings: RoomControllerSettingsDTO,
    command?: RoomCommandDTO,
  ): Promise<void> {
    if (!settings.fan) {
      this.logger.warn(`No registered fan for room ${settings.friendlyName}`);
      return;
    }
    const increment = command.increment || 1;
    await eachSeries(PEAT(increment), async (count, callback) => {
      this.fanDomain.fanSpeedDown(settings.fan);
      callback();
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

  private injectHttp(app: INestApplication, methods: string[]): void {
    const routeInjector = app.get(RouteInjector);
    methods.forEach((method) => {
      routeInjector.inject({
        instance: this,
        method: 'put',
        name: method,
        path: `/${method}`,
      });
    });
  }
}
