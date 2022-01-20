import { Injectable } from '@nestjs/common';

import { KeyModifiers, TableBuilderElement, tKeyMap } from '../contracts';

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
  configure?: () => void;
  customKeymap?: (
    config: TableBuilderElement & { type: string },
    current: unknown,
  ) => tKeyMap;
  lineColor?: (config: ACTIVE_CONFIG) => string;
  onKeyPress(
    config: ACTIVE_CONFIG & { [key: string]: unknown },
    key: string,
    modifiers: KeyModifiers,
  ): ACTIVE_CONFIG | Promise<ACTIVE_CONFIG>;
  // Just dump it all in there, don't worry about it
  render(
    data: ACTIVE_CONFIG & { current: unknown; width: number } & Record<
        string,
        unknown
      >,
  ): string;
}
