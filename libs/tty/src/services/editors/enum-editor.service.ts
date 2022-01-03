import { Injectable } from '@nestjs/common';
import { ARRAY_OFFSET, INCREMENT, START, VALUE } from '@text-based/utilities';
import chalk from 'chalk';

import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { TextRenderingService } from '../render';

export interface EnumEditorRenderOptions<T extends unknown = unknown> {
  current: T;
  label?: string;
  options: [string, T][];
}

@Injectable()
export class EnumEditorService {
  constructor(private readonly textRendering: TextRenderingService) {}

  public readonly keyMap = new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'clear', key: 'escape' }, ''],
    [{ description: 'up', key: 'up' }, ''],
    [{ description: 'down', key: 'down' }, ''],
  ]);

  public onKeyPress(
    config: EnumEditorRenderOptions,
    key: string,
  ): EnumEditorRenderOptions {
    switch (key) {
      case 'tab':
        return undefined;
      case 'escape':
        config.current = '';
        break;
      case 'up':
        this.previous(config);
        break;
      case 'down':
        this.next(config);
        break;
    }
    return config;
  }

  public render(config: EnumEditorRenderOptions): string {
    const items = this.textRendering.selectRange(
      config.options,
      config.current,
    );
    const longest = ansiMaxLength(items.map(([i]) => i));
    const content = items
      .map(([label, value]) => {
        if (value === config.current) {
          return chalk.black.bgCyan(ansiPadEnd(label, longest));
        }
        return label;
      })
      .join(`\n`);

    return this.textRendering.pad(content);
  }

  private next(config: EnumEditorRenderOptions): void {
    const index = config.options.findIndex(
      ([, value]) => config.current === value,
    );
    if (index === config.options.length - ARRAY_OFFSET) {
      config.current = config.options[START][VALUE];
      return;
    }
    config.current = config.options[index + INCREMENT][VALUE];
  }

  private previous(config: EnumEditorRenderOptions): void {
    const index = config.options.findIndex(
      ([, value]) => config.current === value,
    );
    if (index === START) {
      config.current = config.options[START][VALUE];
      return;
    }
    config.current = config.options[index - INCREMENT][VALUE];
  }
}
