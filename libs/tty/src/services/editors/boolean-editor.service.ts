import chalk from 'chalk';

import { Editor, iBuilderEditor } from '../../decorators';
import { TextRenderingService } from '../render';

export interface BooleanEditorRenderOptions {
  current: boolean;
  label?: string;
}

@Editor({
  keyMap: new Map([
    [{ description: 'cancel', key: 'tab' }, ''],
    [{ description: 'left', key: 'left' }, ''],
    [{ description: 'right', key: 'right' }, ''],
  ]),
  type: 'boolean',
})
export class BooleanEditorService
  implements iBuilderEditor<BooleanEditorRenderOptions>
{
  constructor(private readonly textRendering: TextRenderingService) {}

  public onKeyPress(
    config: BooleanEditorRenderOptions,
    key: string,
  ): BooleanEditorRenderOptions {
    if (key === 'left') {
      config.current = true;
    }
    if (key === 'right') {
      config.current = false;
    }
    return config;
  }

  public render(config: BooleanEditorRenderOptions): string {
    const content = [
      chalk`{${config.current ? 'magenta.bold' : 'gray'} true}`, // [config.current ? 'magenta' : 'gray']('true'),
      chalk`{${!config.current ? 'magenta.bold' : 'gray'} false}`, // [!config.current ? 'magenta' : 'gray']('false'),
    ].join(' ');
    return this.textRendering.pad(content);
  }
}
