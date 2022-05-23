import chalk from 'chalk';

import { Editor } from '../../decorators';
import { TextRenderingService } from '../render';

export interface BooleanEditorRenderOptions {
  current: boolean;
  label?: string;
}

@Editor({ type: 'boolean' })
export class BooleanEditorService {
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
