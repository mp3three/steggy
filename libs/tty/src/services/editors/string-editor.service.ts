import { Injectable } from '@nestjs/common';
import { InjectConfig, is } from '@text-based/utilities';
import chalk from 'chalk';

import { LEFT_PADDING } from '../../config';
import { ansiPadEnd } from '../../includes';
import { TextRenderingService } from '../render';

interface RenderOptions {
  current: string;
  hideHelp?: boolean;
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

  public onKeyPress(options: RenderOptions, key: string): RenderOptions {
    options.current += key;
    return options;
  }

  public render(options: RenderOptions): string {
    if (is.empty(options.current)) {
      return this.renderBox(options, 'bgBlue');
    }
    return this.renderBox(options, 'bgWhite');
  }

  private footer(): string {
    return [].join(`\n`);
  }

  private renderBox(options: RenderOptions, bgColor: string): string {
    const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
    const maxLength = options.width - this.leftPadding - this.leftPadding;
    const out: string[] = [];
    if (options.label) {
      out.push(chalk.bold(options.label));
    }
    out.push(
      chalk[bgColor].black(
        ansiPadEnd(INTERNAL_PADDING + placeholder, maxLength),
      ),
    );
    if (!options.hideHelp) {
      out.push(this.footer());
    }
    return this.textRendering.pad(out.join(`\n`));
  }
}
