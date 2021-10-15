import {
  KunamiSensor,
  ROOM_SENSOR_TYPE,
  RoomDTO,
  RoomSensorDTO,
} from '@automagical/controller-logic';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { HomeFetchService } from '../home-fetch.service';
import { KunamiBuilderService } from './kunami-builder.service';

@Injectable()
export class RoomSensorsService {
  constructor(
    private readonly promptService: PromptService,
    private readonly kunamiBuilder: KunamiBuilderService,
    private readonly fetchService: HomeFetchService,
    private readonly logger: AutoLogService,
  ) {}

  public async build(
    room: RoomDTO,
    current?: KunamiSensor,
  ): Promise<[RoomDTO, KunamiSensor]> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current?.name,
    );
    if (
      room.sensors.some(
        ({ name, id }) => name === friendlyName && id !== current?.id,
      )
    ) {
      this.logger.error(`Duplicate name`);
      return await this.build(room, current);
    }
    const command = await this.kunamiBuilder.buildRoomCommand(
      room,
      current?.command,
    );
    room = await this.fetchService.fetch({
      body: {
        command,
        name: friendlyName,
        type: ROOM_SENSOR_TYPE.kunami,
      } as KunamiSensor,
      method: current ? 'put' : 'post',
      url: `/room/${room._id}/sensor${current ? `/${current.id}` : ``}`,
    });
    const sensor = room.sensors.find(
      ({ name }) => name === friendlyName,
    ) as KunamiSensor;
    return [room, sensor];
  }

  public async exec(
    room: RoomDTO,
    defaultAction?: RoomSensorDTO | string,
  ): Promise<RoomDTO> {
    const action = await this.promptService.menuSelect(
      this.promptService.itemsFromEntries<RoomSensorDTO | string>([
        ['Add', 'add'],
        ...this.promptService.conditionalEntries(
          !IsEmpty(room.save_states ?? []),
          [
            new inquirer.Separator(),
            ...(room.sensors.map((state) => [state.name, state]) as [
              string,
              RoomSensorDTO,
            ][]),
          ],
        ),
      ]),
      undefined,
      defaultAction,
    );
    switch (action) {
      case CANCEL:
        return room;
      case 'add':
        [room] = await this.build(room);
        return await this.exec(room, action);
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Action not implemented`);
      return room;
    }
    [room] = await this.process(room, action as KunamiSensor);
    return await this.exec(room, action);
  }

  public async process(
    room: RoomDTO,
    sensor: KunamiSensor,
  ): Promise<[RoomDTO, RoomSensorDTO]> {
    const action = await this.promptService.menuSelect(
      this.promptService.itemsFromEntries([
        ['Activate', 'activate'],
        ['Describe', 'describe'],
        ['Delete', 'delete'],
        ['Modify', 'modify'],
      ]),
    );
    switch (action) {
      case CANCEL:
        return [room, sensor];
      case 'describe':
        console.log(encode(sensor));
        return await this.process(room, sensor);
      case 'delete':
        room = await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}/sensor/${sensor.id}`,
        });
        return [room, undefined];
      case 'modify':
        [room, sensor] = await this.build(room, sensor);
        return await this.process(room, sensor);
      case 'activate':
        await this.fetchService.fetch({
          method: 'post',
          url: `/room/${room._id}/sensor/${sensor.id}`,
        });
        return await this.process(room, sensor);
    }
    return [room, sensor];
  }
}
