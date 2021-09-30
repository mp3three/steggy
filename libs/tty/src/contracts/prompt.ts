import Separator from 'inquirer/lib/objects/separator';

export const CANCEL = 'cancel';
export type PromptMenuItems<T extends unknown = string> = (
  | Record<'name' | 'value', T>
  | Separator
)[];
