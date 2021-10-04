import { CONCURRENT_CHANGES } from '@automagical/controller-logic';
import {
  EntityManagerService,
  LightDomainService,
  LightStateDTO,
} from '@automagical/home-assistant';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eachLimit } from 'async';
import { v4 as uuid } from 'uuid';

import {
  GroupDTO,
  LIGHTING_MODE,
  PersistenceLightStateDTO,
} from '../../contracts';
import { LightManagerService } from '../light-manager.service';
import { GroupPersistenceService } from '../persistence';

const START = 0;
/**
 * Light groups are intended to work with just light domain devices
 */
@Injectable()
export class LightGroupService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly groupPersistence: GroupPersistenceService,
    private readonly entityManager: EntityManagerService,
    private readonly lightDomain: LightDomainService,
    private readonly lightManager: LightManagerService,
    @InjectConfig(CONCURRENT_CHANGES)
    private readonly eachLimit: number,
  ) {}

  /**
   * Take the current state of the group and add it as a saved state
   */
  @Trace()
  public async captureState(
    group: GroupDTO<PersistenceLightStateDTO> | string,
    name: string,
  ): Promise<string> {
    const id = uuid();

    group = await this.loadGroup(group);
    const states = this.getState(group);

    group.states ??= [];
    group.states.push({
      id,
      name,
      states,
    });

    await this.groupPersistence.update(group);
    return id;
  }

  @Trace()
  public getState(
    group: GroupDTO<PersistenceLightStateDTO>,
  ): PersistenceLightStateDTO[] {
    return group.entities.map((id) => {
      const [light] = this.entityManager.getEntity<LightStateDTO>([id]);
      return {
        brightness: light.attributes.brightness,
        hs: light.attributes.hs_color,
        state: light.state,
      } as PersistenceLightStateDTO;
    });
  }

  @Trace()
  public async loadFromState(
    group: GroupDTO<PersistenceLightStateDTO> | string,
    load: string,
  ): Promise<void> {
    group = await this.loadGroup(group);
    const state = group.states?.find(({ id }) => id === load);
    if (!state) {
      throw new NotFoundException(`Bad state id ${load}`);
    }
    // await eachLimit(state.states, this.eachLimit, (state, callback) => {
    //   callback();
    // });
  }

  @Trace()
  public async rotateColors(
    direction: 'forward' | 'reverse' = 'forward',
  ): Promise<void> {
    //
  }

  @Trace()
  public async setBrightness(): Promise<void> {
    //
  }

  @Trace()
  public async turnOff(): Promise<void> {
    //
  }

  @Trace()
  public async turnOn(): Promise<void> {
    //
  }

  private async loadGroup(
    group: GroupDTO<PersistenceLightStateDTO> | string,
  ): Promise<GroupDTO<PersistenceLightStateDTO>> {
    if (typeof group === 'string') {
      group = await this.groupPersistence.findById(group);
    }
    if (!group) {
      throw new BadRequestException(`Could not load group`);
    }
    return group;
  }

  private async setState(
    entites: string[],
    state: PersistenceLightStateDTO[],
  ): Promise<void> {
    if (entites.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entites.length);
    }
    await eachLimit(
      state.map((state, index) => {
        return [entites[index], state];
      }) as [string, PersistenceLightStateDTO][],
      this.eachLimit,
      async ([id, state], callback) => {
        if (state.state === 'off') {
          await this.lightManager.turnOff(id);
          return callback();
        }
        switch (state.mode) {
          case LIGHTING_MODE.circadian:
            await this.lightManager.circadianLight(id, state.brightness);
            break;
          case LIGHTING_MODE.on:
            await this.lightDomain.turnOn(id, {
              // brightness:
            });
            break;
          default:
            throw new InternalServerErrorException(
              `Unknown lighting mode: ${state.mode}`,
            );
        }
        callback();
      },
    );
  }
}
