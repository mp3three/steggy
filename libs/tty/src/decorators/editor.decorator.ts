import { Injectable } from '@nestjs/common';

import { tKeyMap } from './inquirer.decorator';

export const EDITOR_CONFIG = Symbol('editor');

export interface EditorOptions {
  /**
   * For informational purposes only. Does not provide binding... yet? 🤔
   */
  keyMap: tKeyMap;
  /**
   * Must be unique
   */
  type: string;
}

export function Editor(options: EditorOptions): ClassDecorator {
  return function (target) {
    target[EDITOR_CONFIG] = options;
    return Injectable()(target);
  };
}
export interface iBuilderEditor<T = unknown> {
  onKeyPress: (
    config: T,
    key: string,
    modifiers: Record<'ctrl' | 'shift' | 'meta', boolean>,
  ) => T | Promise<T>;
  render(config: T, width: number): string;
}
