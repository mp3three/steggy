import { ARRAY_OFFSET, INCREMENT, START, VALUE } from '@text-based/utilities';
import chalk from 'chalk';

import { Editor, iBuilderEditor } from '../../decorators';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { TextRenderingService } from '../render';

export interface EnumEditorRenderOptions<T extends unknown = unknown> {
  current: T;
  entries: [string, T][];
  label?: string;
}

@Editor({
  keyMap: new Map([
    [{ description: 'cancel', key: 'escape' }, ''],
    [{ description: 'up', key: 'up' }, ''],
    [{ description: 'down', key: 'down' }, ''],
  ]),
  type: 'enum',
})
export class EnumEditorService
  implements iBuilderEditor<EnumEditorRenderOptions>
{
  constructor(private readonly textRendering: TextRenderingService) {}

  public onKeyPress(
    config: EnumEditorRenderOptions,
    key,
  ): EnumEditorRenderOptions {
    switch (key) {
      case 'escape':
        return undefined;
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
    config.current ??= config.entries[START][VALUE];
    const items = this.textRendering.selectRange(
      config.entries,
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
    config.current ??= config.entries[START][VALUE];
    const index = config.entries.findIndex(
      ([, value]) => config.current === value,
    );
    if (index === config.entries.length - ARRAY_OFFSET) {
      config.current = config.entries[START][VALUE];
      return;
    }
    config.current = config.entries[index + INCREMENT][VALUE];
  }

  private previous(config: EnumEditorRenderOptions): void {
    config.current ??= config.entries[START][VALUE];
    const index = config.entries.findIndex(
      ([, value]) => config.current === value,
    );
    if (index === START) {
      config.current =
        config.entries[config.entries.length - ARRAY_OFFSET][VALUE];
      return;
    }
    config.current = config.entries[index - INCREMENT][VALUE];
  }
}
