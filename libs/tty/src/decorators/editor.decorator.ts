import { Injectable } from '@nestjs/common';

export const EDITOR_CONFIG = Symbol('editor');

export interface EditorOptions {
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

export interface iBuilderEditor<ACTIVE_CONFIG = unknown, VALUE_TYPE = unknown> {
  configure: (
    config: ACTIVE_CONFIG,
    done: (type: VALUE_TYPE | VALUE_TYPE[]) => void,
  ) => void;
  // Just dump it all in there, don't worry about it
  render(): void;
}
