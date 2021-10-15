import {
  KunamiSensor,
  ROOM_SENSOR_TYPE,
  RoomDTO,
  RoomSaveStateDTO,
  RoomSensorDTO,
} from '@automagical/controller-logic';
import { CANCEL, PromptService } from '@automagical/tty';
import { AutoLogService, IsEmpty } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
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

  public async addSensor(room: RoomDTO): Promise<RoomDTO> {
    const command = await this.kunamiBuilder.buildRoomCommand(room);
    return await this.fetchService.fetch({
      body: {
        command,
        type: ROOM_SENSOR_TYPE.kunami,
      } as KunamiSensor,
      method: 'post',
      url: `/room/${room._id}/sensor`,
    });
  }

  public async exec(room: RoomDTO, defaultAction?: string): Promise<RoomDTO> {
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
        room = await this.addSensor(room);
        return await this.exec(room, action);
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Action not implemented`);
      return room;
    }
  }

  public async process(
    room: RoomDTO,
    sensor: RoomSensorDTO,
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
        return;
      case 'describe':
        console.log(encode(sensor));
        return await this.process(room, sensor);
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}/sensor/${sensor.id}`,
        });
        return [room, undefined];
      case 'modify':
        throw new NotImplementedException();
      case 'activate':
        await this.fetchService.fetch({
          method: 'post',
          url: `/room/${room._id}/sensor/${sensor.id}`,
        });
        throw new NotImplementedException();
    }
    return [room, sensor];
  }
}
