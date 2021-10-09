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
import { each } from 'async';

import { KUNAMI_TIMEOUT } from '../../config';
import {
  KunamiSensor,
  KunamiSensorEvent,
  ROOM_SENSOR_TYPE,
} from '../../contracts';
import { GroupService } from '../groups';
import { RoomService } from '../rooms';

type ActiveMatcher = KunamiSensorEvent & { callback: () => Promise<void> };
type Watcher = KunamiSensor & { callback: () => Promise<void> };

@Injectable()
export class SensorEventsService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(KUNAMI_TIMEOUT) private readonly kunamiTimeout: number,
    private readonly roomService: RoomService,
    private readonly groupService: GroupService,
  ) {}

  private ACTIVE_MATCHERS = new Map<string, ActiveMatcher[]>();
  /**
   * entity id to list of matchers interested in it
   */
  private WATCHED_SENSORS = new Map<string, Watcher[]>();

  @Trace()
  public async refresh(): Promise<void> {
    const rooms = await this.roomService.list();
    this.WATCHED_SENSORS = new Map();
    rooms.forEach((room) => {
      room.sensors ??= [];
      room.sensors.forEach((sensor) => {
        if (sensor.type === ROOM_SENSOR_TYPE.kunami) {
          const list: Watcher[] =
            this.WATCHED_SENSORS.get(sensor.entity_id) || [];
          list.push({
            command: sensor,
            async callback() {
              //
            },
          });
          this.WATCHED_SENSORS.set(sensor.entity_id, list);
        }
      });
    });
  }

  @Trace()
  @OnEvent(HA_EVENT_STATE_CHANGE)
  protected async onUpdate({ data }: HassEventDTO): Promise<void> {
    if (!this.WATCHED_SENSORS.has(data.entity_id)) {
      return;
    }
    this.initWatchers(data.entity_id);
    // Build up list of ative matchers
    const process: ActiveMatcher[] = [];
    this.ACTIVE_MATCHERS.get(data.entity_id).forEach((event) => {
      if (event.rejected || event.completed) {
        return;
      }
      process.push(event);
    });
    const state = String(data.new_state.state);
    // Append new state to each matcher, test, then run callback
    await each(process, async (item, callback) => {
      const { command } = item.sensor;
      // Ignore if default state
      if (state === command.defaultState && !command.includeDefaultState) {
        return callback();
      }
      // Append to list of observed states
      item.progress.push(state);
      // Has appending this event invalidated the command?
      const isValid = item.progress.every(
        (item, index) => command.match[index] === item,
      );
      if (!isValid) {
        item.rejected = true;
        return callback();
      }
      // Has appending this event completed the command?
      item.completed = item.progress.length === command.match.length;
      if (!item.completed) {
        return callback();
      }
      await item.callback();
      callback();
    });
  }

  @Trace()
  private initWatchers(entity_id: string): void {
    if (!this.ACTIVE_MATCHERS.has(entity_id)) {
      const initialEvents: ActiveMatcher[] = [];
      this.WATCHED_SENSORS.forEach((sensors) => {
        sensors.list.forEach((sensor) => {
          initialEvents.push({
            callback: sensors.callback,
            progress: [],
            rejected: false,
            sensor,
          });
        });
      });
      this.ACTIVE_MATCHERS.set(entity_id, initialEvents);
    }
  }
}
