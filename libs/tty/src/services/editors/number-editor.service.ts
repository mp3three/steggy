import { InjectConfig, INVERT_VALUE, is, START } from '@text-based/utilities';
import chalk from 'chalk';

import { LEFT_PADDING } from '../../config';
import { Editor, iBuilderEditor } from '../../decorators';
import { ansiPadEnd } from '../../includes';
import { TextRenderingService } from '../render';

export interface NumberEditorRenderOptions {
  current: number;
  label?: string;
  locale?: boolean;
  max?: number;
  min?: number;
}

const INTERNAL_PADDING = ' ';

@Editor({
  keyMap: new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'left', key: 'left' }, ''],
    [{ description: 'right', key: 'right' }, ''],
  ]),
  type: 'number',
})
export class NumberEditorService
  implements iBuilderEditor<NumberEditorRenderOptions>
{
  constructor(
    private readonly textRendering: TextRenderingService,
    @InjectConfig(LEFT_PADDING) private readonly leftPadding: number,
  ) {}

  public readonly keyMap = new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'left', key: 'left' }, ''],
    [{ description: 'right', key: 'right' }, ''],
  ]);

  public onKeyPress(
    config: NumberEditorRenderOptions,
    key: string,
  ): NumberEditorRenderOptions {
    const current = config.current.toString();
    if (key === '.' && current.includes('.')) {
      return;
    }
    if ([...'.1234567890'].includes(key)) {
      config.current = Number(current + key);
    }
    if (key === 'backspace' && !is.empty(current)) {
      config.current = Number(current.slice(START, INVERT_VALUE) || START);
    }
    if (key === 'up') {
      config.current++;
    }
    if (key === 'down') {
      config.current--;
    }

    return config;
  }

  public render(config: NumberEditorRenderOptions, width: number): string {
    const out: string[] = [];
    const value = config.label
      ? config.current.toLocaleString()
      : config.current.toString();
    if (config.label) {
      out.push(chalk.bold.magenta.dim(config.label));
    }
    let color = 'bgWhite';
    if (is.number(config.max) && config.current > config.max) {
      color = 'bgRed';
    }
    const maxLength = width - this.leftPadding - this.leftPadding;
    out.push(
      chalk[color].black(ansiPadEnd(INTERNAL_PADDING + value, maxLength)),
    );
    return this.textRendering.pad(out.join(`\n`));
  }
}
