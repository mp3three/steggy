import { DOWN, UP } from '@steggy/utilities';

type listItem = Record<'type' | 'name' | 'description', string>;
export const ROUTINE_COMMAND_LIST = [
  {
    description: 'Change an entity state',
    name: 'Entity State',
    type: 'entity_state',
  },
  {
    description: 'Activate a previously saved group state',
    name: 'Group State',
    type: 'group_state',
  },
  {
    description: 'Perform a special group action',
    name: 'Group Action',
    type: 'group_action',
  },
  {
    description: 'Activate a previously saved room state',
    name: 'Room State',
    type: 'room_state',
  },
  {
    description: 'Activate a previously saved person state',
    name: 'Person State',
    type: 'person_state',
  },
].sort((a, b) => (a.name > b.name ? UP : DOWN)) as listItem[];
