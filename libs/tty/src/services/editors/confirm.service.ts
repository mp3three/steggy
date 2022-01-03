import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { TextRenderingService } from '../render';

export interface ConfirmEditorRenderOptions {
  current: boolean;
  label?: string;
}

@Injectable()
export class ConfirmEditorService {
  constructor(private readonly textRendering: TextRenderingService) {}

  public readonly keyMap = new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'left', key: 'left' }, ''],
    [{ description: 'right', key: 'right' }, ''],
  ]);

  public onKeyPress(
    config: ConfirmEditorRenderOptions,
    key: string,
  ): ConfirmEditorRenderOptions {
    if (key === 'left') {
      config.current = true;
    }
    if (key === 'right') {
      config.current = false;
    }
    if (key === 'tab') {
      return undefined;
    }
    return config;
  }

  public render(config: ConfirmEditorRenderOptions, width: number): string {
    const content = [
      chalk`{${config.current ? 'magenta.bold' : 'gray'} yes}`, // [config.current ? 'magenta' : 'gray']('true'),
      chalk`{${!config.current ? 'magenta.bold' : 'gray'} no}`, // [!config.current ? 'magenta' : 'gray']('false'),
    ].join(' ');
    return (
      chalk.yellow.dim('='.repeat(width)) +
      this.textRendering.pad(chalk`\n{yellow.bold ${config.label}}\n${content}`)
    );
  }
}
