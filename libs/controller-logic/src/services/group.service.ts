import {
  domain,
  EntityManagerService,
  HASS_DOMAINS,
  HassStateDTO,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { AutoLogService, Trace } from '@automagical/utilities';
import { BadRequestException, Injectable } from '@nestjs/common';

import { DescribeGroupResponseDTO } from '../contracts';
import { LightManagerService } from './light-manager.service';
import { RoomManagerService } from './room-manager.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly roomManager: RoomManagerService,
    private readonly switchService: SwitchDomainService,
    private readonly lightManager: LightManagerService,
  ) {}

  @Trace()
  public allGroups(): Map<[string, string], HassStateDTO[]> {
    const out = new Map<[string, string], HassStateDTO[]>();
    this.roomManager.settings.forEach((settings) => {
      const groups = Object.keys(settings.groups ?? {});
      if (groups.length === 0) {
        return;
      }
      groups.forEach((group) => {
        out.set(
          [settings.name, group],
          this.entityManager.getEntity(settings.groups[group]),
        );
      });
    });
    return out;
  }

  @Trace()
  public describeGroup(room: string, group: string): DescribeGroupResponseDTO {
    const settings = this.roomManager.settings.get(room);
    if (!settings?.groups) {
      throw new BadRequestException(`Room does not contain groups`);
    }
    return {
      states: this.entityManager.getEntity(settings.groups[group] ?? []),
    };
  }

  @Trace()
  public async turnOn(room: string, group: string): Promise<void> {
    const entities = this.getGroups(room, group);
    const lights = entities.filter((id) => domain(id) === HASS_DOMAINS.light);
    const switches = entities.filter(
      (id) => domain(id) === HASS_DOMAINS.switch,
    );
    await this.lightManager.turnOnEntities(lights);
    await this.switchService.turnOn(switches);
  }

  @Trace()
  public async turnOnCircadian(room: string, group: string): Promise<void> {
    const entities = this.getGroups(room, group);
    const lights = entities.filter((id) => domain(id) === HASS_DOMAINS.light);
    const switches = entities.filter(
      (id) => domain(id) === HASS_DOMAINS.switch,
    );
    await this.lightManager.circadianLight(lights);
    await this.switchService.turnOn(switches);
  }

  @Trace()
  public async turnOff(room: string, group: string): Promise<void> {
    const entities = this.getGroups(room, group);
    const lights = entities.filter((id) => domain(id) === HASS_DOMAINS.light);
    const switches = entities.filter(
      (id) => domain(id) === HASS_DOMAINS.switch,
    );
    await this.lightManager.turnOffEntities(lights);
    await this.switchService.turnOff(switches);
  }

  private getGroups(room: string, group: string): string[] {
    const settings = this.roomManager.settings.get(room);
    if (!settings?.groups) {
      throw new BadRequestException(`Room does not contain groups`);
    }
    return settings.groups[group] ?? [];
  }
}
