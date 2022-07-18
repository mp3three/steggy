import { is, LABEL, SINGLE, VALUE } from '@steggy/utilities';

import { PromptEntry } from '../services';

export const DONE = 'cancel';
/**
 * Here for future use. In case of additional exit codes
 **/
export function IsDone(value: string | unknown): boolean {
  return value === DONE;
}
export type PromptMenuItems<T extends unknown = string> = {
  name: string;
  short?: string;
  value: T;
}[];

// oof
export function GV<T = string>(item: PromptEntry<T>): T {
  if (is.empty(item)) {
    return undefined;
  }
  return item.length === SINGLE
    ? (item[LABEL] as unknown as T)
    : (item[VALUE] as T);
}
