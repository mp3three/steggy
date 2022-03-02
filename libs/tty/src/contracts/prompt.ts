import Separator from 'inquirer/lib/objects/separator';

export const DONE = 'cancel';
/**
 * Here for future use. In case of additional exit codes
 **/
export function IsDone(value: string | unknown): boolean {
  return value === DONE;
}
export type PromptMenuItems<T extends unknown = string> = (
  | { name: string; short?: string; value: T }
  | Separator
)[];
