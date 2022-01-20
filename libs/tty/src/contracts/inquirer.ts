import { Key } from 'readline';
export type KeyDescriptor = { key: Key; value?: string };
export type MenuEntry<T extends unknown = string> = [string, T];
export interface MainMenuEntry<T = unknown> {
  entry: MenuEntry<T>;
  helpText?: string;
  icon?: string;
  type?: string;
}
export type tKeyMap = Map<InquirerKeypressOptions, string | DirectCB>;
export type KeyModifiers = Record<'ctrl' | 'shift' | 'meta', boolean>;
export type DirectCB = (
  key: string,
  mods: KeyModifiers,
) => void | boolean | Promise<void | boolean>;
export interface InquirerKeypressOptions {
  active?: () => boolean;
  catchAll?: boolean;
  description?: string;
  key?: string | string[];
  modifiers?: Partial<KeyModifiers>;
  noHelp?: boolean;
}
