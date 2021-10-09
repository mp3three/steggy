import { ROOM_SENSOR_TYPE } from '@automagical/controller-logic';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { KUNAMI_TIMEOUT } from '../../config';
import { RoomService } from '../rooms';

@Injectable()
export class SensorEventsService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(KUNAMI_TIMEOUT) private readonly kunamiTimeout: number,
    private readonly roomService: RoomService,
  ) {}

  @Trace()
  public async refresh(): Promise<void> {
    const list = await this.buildSensorList();
  }

  @Trace()
  private async buildSensorList(): Promise<string[]> {
    const rooms = await this.roomService.list();
    const out: string[] = [];
    rooms.forEach((room) => {
      room.sensors ??= [];
      room.sensors.forEach((sensor) => {
        if (sensor.type === ROOM_SENSOR_TYPE.kunami) {
          out.push(sensor.entity_id);
        }
      });
    });
    return out;
  }
}
