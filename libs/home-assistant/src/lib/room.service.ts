import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import SolarCalcType from 'solar-calc/types/solarCalc';
import { BaseRoom } from './base.room';
import { DoArgs, GlobalSetArgs, SceneRoom } from './scene.room';
import * as SolarCalc from 'solar-calc';
import * as dayjs from 'dayjs';

export type RoomDoArgs = DoArgs & { roomCode: string };
@Injectable()
export class RoomService extends EventEmitter {
  // #region Static Properties

  // Near Austin, TX... I think. Deleted a few digits
  public static readonly LAT = 30.3114;
  public static readonly LONG = -97.534;
  public static readonly ROOM_LIST: Record<string, BaseRoom> = {};

  private static _SOLAR_CALC = null;

  // #endregion Static Properties

  // #region Public Static Accessors

  public static get IS_EVENING(): boolean {
    // For the purpose of the house, it's considered evening if the sun has set, or it's past 6PM

    const now = dayjs();
    return (
      now.isAfter(this.SOLAR_CALC.sunset) ||
      now.isAfter(now.startOf('day').add(12 + 6, 'hour')) ||
      now.isBefore(this.SOLAR_CALC.sunrise)
    );
  }

  public static get SOLAR_CALC(): SolarCalcType {
    if (this._SOLAR_CALC) {
      return this._SOLAR_CALC;
    }
    setTimeout(() => (this._SOLAR_CALC = null), 1000 * 30);
    // typescript is wrong this time, it works as expected for me
    // eslint-disable-next-line
    // @ts-ignore
    return new SolarCalc(new Date(), RoomService.LAT, RoomService.LONG);
  }

  // #endregion Public Static Accessors

  // #region Object Properties

  private readonly logger = Logger(RoomService);

  // #endregion Object Properties

  // #region Public Methods

  public exec(args: RoomDoArgs): Promise<void> {
    if (!args.roomCode) {
      this.logger.alert(`RoomCode is required`);
      return;
    }
    const room = RoomService.ROOM_LIST[args.roomCode] as SceneRoom;
    if (!room) {
      this.logger.alert(`${args.roomCode} is not a valid Room`);
      return;
    }
    return room.exec(args);
  }

  public async globalExec(args: GlobalSetArgs): Promise<void> {
    const room = Object.values(RoomService.ROOM_LIST).find(
      (room) => room instanceof SceneRoom,
    ) as SceneRoom;
    room.exec(args);
  }

  // #endregion Public Methods
}
