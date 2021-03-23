import { Logger } from '@automagical/logger';
import * as _ from 'lodash';
import { Dictionary } from 'lodash';
import { FanSpeeds, PicoButtons } from '../typings';
import { BaseRoom, BaseRoomConfig } from './base.room';
import { FanEntity } from './entities/fan.entity';
import { GroupEntity } from './entities/group.entity';
import { LightEntity } from './entities/light.entity';
import { SensorEntity } from './entities/sensor.entity';
import { SwitchEntity } from './entities/switch.entity';
import { RoomDoArgs, RoomService } from './room.service';

export enum RokuInputs {
  off = 'off',
  hdmi1 = 'hdmi1',
  hdmi2 = 'hdmi2',
  hdmi3 = 'hdmi3',
}

export enum RoomCode {
  loft = 'loft',
  living = 'living_room',
  bedroom = 'bedroom',
  games = 'games',
  guest = 'guest',
  kitchen = 'kitchen',
  garage = 'garage',
}

export enum CircadianModes {
  off = 'off',
  low = 'low',
  high = 'high',
}
export enum RoomScene {
  unknown = 'unknown',
  off = 'off',
  low = 'low',
  medium = 'medium',
  high = 'high',
}

type SceneDefinition = Record<
  'all' | 'day' | 'evening',
  {
    circadian: CircadianModes;
  } & Record<'off' | 'on' | 'acc', string[]>
>;
export type SceneRoomConfig = Record<RoomScene, SceneDefinition> &
  BaseRoomConfig & {
    groups: Dictionary<string[]>;
    config: {
      temperature: string;
      pico: string;
      fan: string;
      circadian: {
        high: string;
        low: string;
      };
    };
  };

export type SetArgs = {
  accessories?: boolean;
  leaveFan?: boolean;
};
export type DoArgs = SetArgs & {
  scene?: RoomScene;
};
export type GlobalSetArgs = SetArgs & {
  setDir?: boolean;
  removeThis?: boolean;
  everything?: boolean;
  roomList?: RoomCode[];
};
export const DEFAULT_ARGS: GlobalSetArgs = {
  // Translate to all rooms + accessories
  everything: false,
  // Set to high or off
  setDir: false,
  // Disable auto fan logic
  leaveFan: false,
  // Toggle accessory entries
  accessories: null,
  // List of rooms to act on
  roomList: [],
};

const ALL_ROOMS = [
  RoomCode.bedroom,
  RoomCode.games,
  RoomCode.guest,
  RoomCode.living,
  RoomCode.loft,
];

export abstract class SceneRoom extends BaseRoom {
  // #region Object Properties

  protected climateSensor: SensorEntity = null;
  protected fan: FanEntity;
  protected roomConfig: SceneRoomConfig;
  protected roomMode: RoomScene = RoomScene.unknown;

  private readonly logger = Logger(SceneRoom);

  private lastPicoButton: PicoButtons;

  // #endregion Object Properties

  // #region Public Methods

  public async exec(args: DoArgs = {}) {
    if (args.scene) {
      this.setMode(args.scene, args.accessories);
      const scene = this.roomConfig[args.scene];
      const isEvening = RoomService.IS_EVENING;
      const actions = scene.all || (isEvening ? scene.evening : scene.day);
      const circadian = this.roomConfig.config.circadian;
      if (circadian) {
        const high = await this.entityService.byId<SwitchEntity>(
          circadian.high,
        );
        const low = await this.entityService.byId<SwitchEntity>(circadian.low);
        switch (actions.circadian) {
          case 'high':
            this.logger.debug(`Circadian ${this.roomCode}: high:on,low:off`);
            high.turnOn();
            low.turnOff();
            break;
          case 'low':
            this.logger.debug(`Circadian ${this.roomCode}: high:off,low:on`);
            low.turnOn();
            high.turnOff();
            break;
          case 'off':
            this.logger.debug(`Circadian ${this.roomCode}: high:off,low:off`);
            high.turnOff();
            low.turnOff();
            break;
        }
      }
      if (actions.on) {
        actions.on.forEach(async (entityId) => {
          const entity = await this.entityService.byId<
            SwitchEntity | LightEntity | GroupEntity
          >(entityId);
          entity.turnOn();
        });
      }
      if (actions.off) {
        actions.off.forEach(async (entityId) => {
          const entity = await this.entityService.byId<
            SwitchEntity | LightEntity | GroupEntity
          >(entityId);
          entity.turnOff();
        });
      }
      if (typeof args.accessories === 'boolean' && actions.acc) {
        actions.acc.forEach(async (entityId) => {
          const entity = await this.entityService.byId<
            SwitchEntity | LightEntity | GroupEntity
          >(entityId);
          if (args.accessories) {
            return entity.turnOn();
          }
          return entity.turnOff();
        });
      }
      this.emit(`scene:${args.scene}`, args);
    }
  }

  public async execGlobal(args: GlobalSetArgs = null) {
    DEFAULT_ARGS.setDir = args.setDir || !RoomService.IS_EVENING;
    const merged: GlobalSetArgs = _.defaults(args || {}, DEFAULT_ARGS);

    let carriesThrough = false;
    if (merged.everything) {
      merged.roomList = [
        RoomCode.bedroom,
        RoomCode.games,
        RoomCode.guest,
        RoomCode.living,
        RoomCode.loft,
      ];
      if (args.removeThis) {
        merged.roomList = merged.roomList.filter((i) => i !== this.roomCode);
      }
      merged.accessories = merged.setDir;
    } else if (merged.roomList.length === 0) {
      carriesThrough = true;
      const append = {
        [RoomCode.games]: [RoomCode.loft],
        [RoomCode.loft]: [RoomCode.bedroom, RoomCode.living],
        [RoomCode.bedroom]: RoomService.IS_EVENING ? [] : [RoomCode.loft],
        [RoomCode.living]: RoomService.IS_EVENING ? [] : [RoomCode.loft],
      };
      merged.roomList = [this.roomCode, ...(append[this.roomCode] || [])];
    }
    merged.roomList.forEach((roomCode) => this.execOther(roomCode, merged));
    if (!carriesThrough) {
      return;
    }
    if (RoomService.IS_EVENING) {
      merged.setDir = false;
    }
    ALL_ROOMS.filter((i) => !merged.roomList.includes(i)).forEach((roomCode) =>
      this.execOther(roomCode, merged),
    );
  }

  public async getTemp(): Promise<number> {
    const tempEntity = await this.entityService.byId<SensorEntity>(
      this.roomConfig.config.temperature,
    );
    return tempEntity.state;
  }

  public async smart(args: DoArgs = {}) {
    process.nextTick(async () => {
      const defaults: GlobalSetArgs = {
        removeThis: true,
      };
      if (RoomService.IS_EVENING) {
        defaults.everything = true;
        defaults.setDir = false;
      }
      const globalArgs = Object.assign(defaults, args);
      await this.execGlobal(globalArgs);
      const temp = await this.getTemp();
      this.setFan(
        temp > 78
          ? FanSpeeds.medium_high
          : temp > 76
          ? FanSpeeds.low
          : FanSpeeds.off,
      );
      // FIXME
      this.logger.alert(`setLocks commented out`);
      // this.homeAssistantService.setLocks(true);
    });
    const execArgs = Object.assign({}, args);
    const scene = RoomService.IS_EVENING ? RoomScene.medium : RoomScene.high;
    execArgs.scene = execArgs.scene || scene;
    execArgs.accessories = !RoomService.IS_EVENING;
    return this.exec(execArgs);
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async bindPico(
    entityId: string,
    singleClick: (
      button: PicoButtons,
      dblClick: (button: PicoButtons) => Promise<void>,
    ) => Promise<void>,
    dblClick: (button: PicoButtons) => Promise<void>,
  ) {
    const pico = await this.entityService.byId<SensorEntity>(entityId);
    pico.on('update', () => singleClick(pico.state, dblClick));
  }

  protected async init() {
    await super.init();
    if (this.roomConfig.groups) {
      await this.entityService.registerGroups(this.roomConfig.groups);
    }
    const config = this.roomConfig.config;
    this.logger.info(`Configure: ${this.friendlyName} pico`);
    this.bindPico(
      config.pico,
      (state) =>
        this.picoCb(state, config, (state) => this.picoDoubleClick(state)),
      (state) => this.picoDoubleClick(state),
    );
    this.logger.info(`Configure: ${this.friendlyName} temperature sensor`);
    this.climateSensor = await this.entityService.byId<SensorEntity>(
      config.temperature,
    );

    this.logger.info(`Configure: ${this.friendlyName} fan`);
    this.fan = await this.entityService.byId(this.roomConfig.config.fan);
    process.nextTick(() => {
      this.logger.info(`${this.friendlyName} = ${this.climateSensor.state}*`);
    });
  }

  protected async picoDoubleClick(state: PicoButtons): Promise<void> {
    this.logger.debug(`Pico double click: ${state}`);
    switch (state) {
      case PicoButtons.on:
        return this.execGlobal({
          everything: true,
          setDir: true,
        });
      case PicoButtons.off:
        return this.execGlobal({
          everything: true,
          setDir: false,
        });
    }
  }

  protected setMode(mode: RoomScene, accessories) {
    this.roomMode = mode;
    this.logger.info(`${this.friendlyName} setMode('${mode}', ${accessories})`);
    this.emit(`roomModeChanged`);
  }

  // #endregion Protected Methods

  // #region Private Methods

  private execOther(roomCode, args) {
    const body = Object.assign({}, args) as RoomDoArgs;
    body.roomCode = roomCode;
    body.scene = body.scene || (args.setDir ? RoomScene.high : RoomScene.off);
    this.roomService.exec(body);
  }

  private picoCb(state: PicoButtons, config, picoDoubleClick) {
    if (state === PicoButtons.none) {
      return;
    }
    if (this.lastPicoButton === state) {
      return picoDoubleClick(state);
    }
    this.lastPicoButton = state;
    setTimeout(() => (this.lastPicoButton = PicoButtons.none), 1000);
    if (state === PicoButtons.favorite) {
      return this.smart({
        accessories: !RoomService.IS_EVENING,
      });
    }
    const map: Dictionary<RoomScene> = {
      [PicoButtons.on]: 'high',
      [PicoButtons.up]: 'medium',
      [PicoButtons.down]: 'low',
      [PicoButtons.off]: 'off',
    };
    if (!map[state]) {
      return;
    }
    this.logger.debug(`${config.pico} ${map[state]}`);
    return this.exec({
      scene: map[state],
      accessories: !RoomService.IS_EVENING,
    });
  }

  private async setFan(fanSpeed: FanSpeeds) {
    switch (fanSpeed) {
      case 'off':
        return this.fan.turnOff();
      default:
        return this.fan.setSpeed(fanSpeed);
    }
  }

  // #endregion Private Methods
}
