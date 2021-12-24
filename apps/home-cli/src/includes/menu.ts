import { DONE, ICONS, MenuEntry } from '@for-science/tty';
import chalk from 'chalk';

const menu = {
  ACTIVATE: [`${ICONS.ACTIVATE}Manual Activate`, 'activate'],
  ADD: [`${ICONS.CREATE}Add`, 'add'],
  CREATE: [`${ICONS.CREATE}Create`, 'create'],
  DELETE: [`${ICONS.DELETE}Delete`, 'delete'],
  DONE: [chalk.bold`Done`, DONE],
  EDIT: [`${ICONS.EDIT}Edit`, 'edit'],
  ENTITIES: [`${ICONS.ENTITIES}Entities`, 'entities'],
  GROUPS: [`${ICONS.GROUPS}Groups`, 'groups'],
  RENAME: [`${ICONS.RENAME}Rename`, 'rename'],
  ROUTINES: [`${ICONS.ROUTINE}Routines`, 'routines'],
  STATE_MANAGER: [`${ICONS.STATE_MANAGER}State Manager`, 'states'],
};

// Only way I could find to get both keys, and types on this
export const MENU_ITEMS: Record<keyof typeof menu, MenuEntry> = menu as Record<
  keyof typeof menu,
  MenuEntry
>;
