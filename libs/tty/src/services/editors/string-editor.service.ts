import {
  InjectConfig,
  INVERT_VALUE,
  is,
  SINGLE,
  START,
} from '@text-based/utilities';
import chalk from 'chalk';

import { LEFT_PADDING } from '../../config';
import { Editor, iBuilderEditor, KeyModifiers } from '../../decorators';
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

@Editor({
  keyMap: new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'clear', key: 'escape' }, ''],
  ]),
  type: 'string',
})
export class StringEditorService
  implements iBuilderEditor<StringEditorRenderOptions>
{
  constructor(
    private readonly textRendering: TextRenderingService,
    @InjectConfig(LEFT_PADDING) private readonly leftPadding: number,
  ) {}

  public onKeyPress(
    config: StringEditorRenderOptions,
    key: string,
    { shift }: KeyModifiers,
  ): StringEditorRenderOptions {
    if (key === 'backspace') {
      config.current ??= '';
      config.current = config.current.slice(START, INVERT_VALUE);
      return config;
    }
    if (key === 'space') {
      config.current ??= '';
      config.current += ' ';
      return config;
    }
    if (key === 'tab') {
      return undefined;
    }
    if (key === 'escape') {
      config.current = '';
      return config;
    }
    if (key.length > SINGLE) {
      return config;
    }
    config.current ??= '';
    config.current += shift ? key.toUpperCase() : key;
    return config;
  }

  public render(options: StringEditorRenderOptions): string {
    if (is.empty(options.current)) {
      return this.renderBox(options, 'bgBlue');
    }
    return this.renderBox(options, 'bgWhite');
  }

  private renderBox(
    config: StringEditorRenderOptions,
    bgColor: string,
  ): string {
    const value = is.empty(config.current)
      ? config.placeholder ?? DEFAULT_PLACEHOLDER
      : config.current;
    const maxLength = config.width - this.leftPadding - this.leftPadding;
    const out: string[] = [];
    if (config.label) {
      out.push(chalk.bold.magenta.dim(config.label));
    }
    out.push(
      chalk[bgColor].black(ansiPadEnd(INTERNAL_PADDING + value, maxLength)),
    );
    return this.textRendering.pad(out.join(`\n`));
  }
}
