import { ResultControlDTO } from '@steggy/utilities';

export enum RELATED_LOOKUPS {
  room_state = 'room_state',
}

const commandType = 'command.type';
export const RELATED_ROUTINES = {
  entity: (value: string) =>
    [
      {
        filters: new Set([
          { field: 'activate.type', value: 'kunami' },
          { field: 'activate.activate.sensor', value },
        ]),
        sort: ['friendlyName'],
      },
      {
        filters: new Set([
          { field: 'activate.type', value: 'state_change' },
          { field: 'activate.activate.entity', value },
        ]),
        sort: ['friendlyName'],
      },
      {
        filters: new Set([
          { commandType, value: 'call_service' },
          { field: 'command.command.entity_id', value },
        ]),
        sort: ['friendlyName'],
      },
    ] as ResultControlDTO[],
  group_action: (value: string) =>
    [
      {
        filters: new Set([
          { field: commandType, value: 'group_action' },
          { field: 'command.command.group', value },
        ]),
        sort: ['friendlyName'],
      },
    ] as ResultControlDTO[],
  group_state: (value: string) =>
    [
      {
        filters: new Set([
          { field: commandType, value: 'group_state' },
          { field: 'command.command.group', value },
        ]),
        sort: ['friendlyName'],
      },
    ] as ResultControlDTO[],
  room_state: (value: string) =>
    [
      {
        filters: new Set([
          { field: commandType, value: 'room_state' },
          { field: 'command.command.room', value },
        ]),
        sort: ['friendlyName'],
      },
    ] as ResultControlDTO[],
  routine: (value: string) =>
    [
      {
        filters: new Set([
          { commandType, value: 'trigger_routine' },
          { field: 'command.command.routine', value },
        ]),
        sort: ['friendlyName'],
      },
    ] as ResultControlDTO[],
};
