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

  public lineColor(): string {
    return 'yellow';
  }

  public onKeyPress(config, key): ConfirmEditorRenderOptions {
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

  public render({ ...config }): string {
    const content = [
      chalk`{${config.current ? 'magenta.bold' : 'gray'} yes}`,
      chalk`{${!config.current ? 'magenta.bold' : 'gray'} no}`,
    ].join(' ');
    return this.textRendering.pad(
      chalk`{yellow.bold ${config.label}}\n${content}`,
    );
  }
}
