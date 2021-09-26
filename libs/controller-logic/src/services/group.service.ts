import {
  domain,
  EntityManagerService,
  HASS_DOMAINS,
  HassStateDTO,
  LightStateDTO,
  SwitchDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  FILTER_OPERATIONS,
  queryToControl,
  Trace,
} from '@automagical/utilities';
import { BadRequestException, Injectable } from '@nestjs/common';

import {
  DescribeGroupResponseDTO,
  PersistenceLightStateDTO,
  RoomStateDTO,
} from '../contracts';
import { LightManagerService } from './light-manager.service';
import { RoomManagerService } from './room-manager.service';
import { StatePersistenceService } from './state-persistence.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly roomManager: RoomManagerService,
    private readonly switchService: SwitchDomainService,
    private readonly lightManager: LightManagerService,
    private readonly persistence: StatePersistenceService,
  ) {}

  /**
   * Capture the current state of all entities (switch + light only) inside a group, and save it to persistence
   */
  @Trace()
  public async captureState(
    room: string,
    group: string,
    captureName: string,
  ): Promise<RoomStateDTO> {
    const { states } = this.describeGroup(room, group);
    const captured = states
      .filter((state) =>
        [HASS_DOMAINS.light, HASS_DOMAINS.switch].includes(
          domain(state.entity_id),
        ),
      )
      .map((state: LightStateDTO) => {
        const out = {
          entity_id: state.entity_id,
          state: state.state,
        } as PersistenceLightStateDTO;
        if (
          domain(state.entity_id) === HASS_DOMAINS.switch ||
          state.state === 'off'
        ) {
          return out;
        }
        out.rgb = state.attributes.rgb_color;
        out.brightness = state.attributes.brightness;
        return out;
      });
    const roomState: RoomStateDTO = {
      entities: captured.map((item) => item.entity_id),
      group,
      name: captureName,
      room,
      states: captured,
    };
    return await this.persistence.create(roomState);
  }

  /**
   * Search for all the saved states declared against this group
   */
  @Trace()
  public async listStatesByGroup(
    room: string,
    group: string,
  ): Promise<RoomStateDTO[]> {
    return await this.persistence.findMany(queryToControl({ group, room }));
  }

  /**
   * Search for saved states that involve this entity
   */
  @Trace()
  public async listStatesByEntity(entity: string): Promise<RoomStateDTO[]> {
    return await this.persistence.findMany({
      filters: new Set([
        {
          field: 'entity',
          operation: FILTER_OPERATIONS.elem,
          value: entity,
        },
      ]),
    });
  }

  /**
   * List all declared groups
   *
   * **Map**<[`roomName`,`groupName`],`entityState[]`>
   */
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
