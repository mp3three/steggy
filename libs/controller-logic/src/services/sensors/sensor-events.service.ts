import {
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  InjectConfig,
  OnEvent,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { KUNAMI_TIMEOUT } from '../../config';
import {
  KunamiSensor,
  KunamiSensorEvent,
  ROOM_SENSOR_TYPE,
} from '../../contracts';
import { RoomService } from '../rooms';

@Injectable()
export class SensorEventsService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(KUNAMI_TIMEOUT) private readonly kunamiTimeout: number,
    private readonly roomService: RoomService,
  ) {}

  private ACTIVE_MATCHERS = new Map<string, KunamiSensorEvent[]>();
  /**
   * entity id to list of matchers interested in it
   */
  private WATCHED_SENSORS = new Map<string, KunamiSensor[]>();

  @Trace()
  public async refresh(): Promise<void> {
    const rooms = await this.roomService.list();
    this.WATCHED_SENSORS = new Map();
    rooms.forEach((room) => {
      room.sensors ??= [];
      room.sensors.forEach((sensor) => {
        if (sensor.type === ROOM_SENSOR_TYPE.kunami) {
          const list = this.WATCHED_SENSORS.get(sensor.entity_id) ?? [];
          list.push(sensor as KunamiSensor);
          this.WATCHED_SENSORS.set(sensor.entity_id, list);
        }
      });
    });
  }

  @OnEvent(HA_EVENT_STATE_CHANGE)
  @Trace()
  protected onUpdate({ data }: HassEventDTO): void {
    if (!this.WATCHED_SENSORS.has(data.entity_id)) {
      return;
    }
    //
  }
}
