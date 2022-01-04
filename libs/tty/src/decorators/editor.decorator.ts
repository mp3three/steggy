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
export interface iBuilderEditor<ACTIVE_CONFIG = unknown> {
  lineColor?: (config: ACTIVE_CONFIG) => string;
  onKeyPress: (
    config: ACTIVE_CONFIG,
    key: string,
    modifiers: Record<'ctrl' | 'shift' | 'meta', boolean>,
  ) => ACTIVE_CONFIG | Promise<ACTIVE_CONFIG>;
  render(currentConfig: { width: number } & ACTIVE_CONFIG): string;
}
