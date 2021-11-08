import Separator from 'inquirer/lib/objects/separator';

export const DONE = 'cancel';
export type PromptMenuItems<T extends unknown = string> = (
  | { name: string; short?: string; value: T }
  | Separator
)[];
