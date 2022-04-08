import { DOWN, UP } from '@steggy/utilities';

type listItem = Record<'type' | 'name' | 'description', string>;
export const ROUTINE_ACTIVATE_LIST = [
  {
    description: 'Activate in response to a pattern of state changes',
    name: 'Sequence',
    type: 'kunami',
  },
  {
    description: 'Activate on a regular cron schedule',
    name: 'Cron Schedule',
    type: 'schedule',
  },
  {
    description: 'Activate in reponse to an entity state comparison',
    name: 'State Change',
    type: 'state_change',
  },
  {
    description:
      'Activate at a predetermined time based on the position of the sun',
    name: 'Solar Event',
    type: 'solar',
  },
].sort((a, b) => (a.name > b.name ? UP : DOWN)) as listItem[];
