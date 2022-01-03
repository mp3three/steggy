import { Injectable } from '@nestjs/common';
import {
  InjectConfig,
  INVERT_VALUE,
  is,
  SINGLE,
  START,
} from '@text-based/utilities';
import chalk from 'chalk';

import { LEFT_PADDING } from '../../config';
import { KeyModifiers } from '../../decorators';
import { ansiPadEnd } from '../../includes';
import { TextRenderingService } from '../render';

export interface StringEditorRenderOptions {
  current: string;
  label?: string;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  validate?: (value: string) => true | string;
  width: number;
}

const DEFAULT_PLACEHOLDER = 'enter value';
const INTERNAL_PADDING = ' ';

@Injectable()
export class StringEditorService {
  constructor(
    private readonly textRendering: TextRenderingService,
    @InjectConfig(LEFT_PADDING) private readonly leftPadding: number,
  ) {}

  public readonly keyMap = new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'clear', key: 'escape' }, ''],
  ]);

  public onKeyPress(
    options: StringEditorRenderOptions,
    key: string,
    { shift }: KeyModifiers,
  ): StringEditorRenderOptions {
    if (key === 'backspace') {
      options.current = options.current.slice(START, INVERT_VALUE);
      return options;
    }
    if (key === 'space') {
      options.current += ' ';
      return options;
    }
    if (key === 'tab') {
      return undefined;
    }
    if (key === 'escape') {
      options.current = '';
      return options;
    }
    if (key.length > SINGLE) {
      return options;
    }
    options.current += shift ? key.toUpperCase() : key;
    return options;
  }

  public render(options: StringEditorRenderOptions): string {
    if (is.empty(options.current)) {
      return this.renderBox(options, 'bgBlue');
    }
    return this.renderBox(options, 'bgWhite');
  }

  private renderBox(
    options: StringEditorRenderOptions,
    bgColor: string,
  ): string {
    const value = is.empty(options.current)
      ? options.placeholder ?? DEFAULT_PLACEHOLDER
      : options.current;
    const maxLength = options.width - this.leftPadding - this.leftPadding;
    const out: string[] = [];
    if (options.label) {
      out.push(chalk.bold.magenta.dim(options.label));
    }
    out.push(
      chalk[bgColor].black(ansiPadEnd(INTERNAL_PADDING + value, maxLength)),
    );
    return this.textRendering.pad(out.join(`\n`));
  }
}
