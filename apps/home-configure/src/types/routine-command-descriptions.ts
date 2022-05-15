import { DOWN, UP } from '@steggy/utilities';

type listItem = Record<'type' | 'name' | 'description', string>;
export const ROUTINE_COMMAND_LIST = [].sort((a, b) =>
  a.name > b.name ? UP : DOWN,
) as listItem[];
