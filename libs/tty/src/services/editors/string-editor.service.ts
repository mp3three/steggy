import { Injectable } from '@nestjs/common';
import { InjectConfig, is } from '@text-based/utilities';
import chalk from 'chalk';

import { LEFT_PADDING } from '../../config';
import { ansiPadEnd } from '../../includes';
import { TextRenderingService } from '../render';

interface RenderOptions {
  current: string;
  maxLength?: number;
  minLength?: number;
  placeholder: string;
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

  public render(options: RenderOptions): string {
    if (is.empty(options.current)) {
      return this.renderEmpty(options);
    }
    return ``;
  }

  private renderEmpty(options: RenderOptions): string {
    const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
    return this.textRendering.pad(
      chalk.bgBlue.black(
        ansiPadEnd(
          INTERNAL_PADDING + placeholder,
          options.width - this.leftPadding - this.leftPadding,
        ),
      ),
    );
  }
}
