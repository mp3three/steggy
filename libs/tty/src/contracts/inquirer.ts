import { Key } from 'readline';
export type KeyDescriptor = { key: Key; value?: string };
export type MenuEntry<T extends unknown = string> = [string, T];
export interface MainMenuEntry<T = unknown> {
  entry: MenuEntry<T>;
  helpText?: string;
  icon?: string;
  type?: string;
}
