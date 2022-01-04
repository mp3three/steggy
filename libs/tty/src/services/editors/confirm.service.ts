import chalk from 'chalk';

import { Editor, iBuilderEditor } from '../../decorators';
import { TextRenderingService } from '../render';

export interface ConfirmEditorRenderOptions {
  current: boolean;
  label?: string;
}

@Editor({
  keyMap: new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'left', key: 'left' }, ''],
    [{ description: 'right', key: 'right' }, ''],
  ]),
  type: 'confirm',
})
export class ConfirmEditorService
  implements iBuilderEditor<ConfirmEditorRenderOptions>
{
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
      chalk`{${config.current ? 'magenta.bold' : 'gray'} yes}`,
      chalk`{${!config.current ? 'magenta.bold' : 'gray'} no}`,
    ].join(' ');
    return (
      chalk.yellow.dim('='.repeat(width)) +
      this.textRendering.pad(chalk`\n{yellow.bold ${config.label}}\n${content}`)
    );
  }
}
