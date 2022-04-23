import { ActivateTypes } from '@steggy/controller-shared';
import { DOWN, UP } from '@steggy/utilities';

type listItem = Record<'name' | 'description', string> & {
  type: ActivateTypes;
};
export const ROUTINE_ACTIVATE_LIST = (
  [
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
      description: 'Activate when person/room metadata changes',
      name: 'Metadata Change',
      type: 'room_metadata',
    },
    {
      description: 'Activate in response to an entity state comparison',
      name: 'State Change',
      type: 'state_change',
    },
    {
      description: 'Activate in response to an entity state comparison',
      name: 'Attribute Change',
      type: 'attribute',
    },
    {
      description:
        'Activate at a predetermined time based on the position of the sun',
      name: 'Solar Event',
      type: 'solar',
    },
    {
      description:
        'Trigger a routine in response to an (otherwise) internal controller event.',
      name: 'Internal Event',
      type: 'internal_event',
    },
  ] as listItem[]
).sort((a, b) => (a.name > b.name ? UP : DOWN));
