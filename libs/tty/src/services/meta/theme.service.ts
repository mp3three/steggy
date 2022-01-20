import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConfig, is } from '@text-based/utilities';
import chalk from 'chalk';

import {
  BACKGROUND_MENU,
  BORDER_COLOR_ACTIVE,
  BORDER_COLOR_ERROR,
  BORDER_COLOR_INACTIVE,
  BORDER_COLOR_WARN,
  TEXT_DETAILS,
  TEXT_HELP,
  TEXT_IMPORTANT,
  TEXT_INFO,
} from '../../config';
import { TABLE_PARTS } from '../../contracts';
import { PlIcons } from '../../icons';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { ColorsService } from '../colors.service';

const BORDERS = 2;
@Injectable()
export class ThemeService {
  constructor(
    @InjectConfig(BORDER_COLOR_ACTIVE)
    private readonly borderActive: string,
    @InjectConfig(BORDER_COLOR_INACTIVE)
    private readonly borderInactive: string,
    @InjectConfig(BORDER_COLOR_WARN)
    private readonly borderWarn: string,
    @InjectConfig(BORDER_COLOR_ERROR)
    private readonly borderError: string,
    @InjectConfig(TEXT_IMPORTANT) private readonly textImportant: string,
    @InjectConfig(TEXT_INFO) private readonly textInfo: string,
    @InjectConfig(TEXT_HELP) private readonly textHelp: string,
    @InjectConfig(BACKGROUND_MENU) private readonly menuBg: string,
    @InjectConfig(TEXT_DETAILS) private readonly textDetails: string,
    @Inject(forwardRef(() => ColorsService))
    private readonly colorService: ColorsService,
  ) {}

  private get maxWidth() {
    const [width] = process.stdout.getWindowSize();
    return width - BORDERS;
  }

  public addBorder(
    content: string,
    type: 'warn' | 'inactive' | 'active' | 'error' = 'inactive',
  ): string {
    let color = '';
    switch (type) {
      case 'inactive':
        color = this.borderInactive;
        break;
      case 'active':
        color = this.borderActive;
        break;
      case 'error':
        color = this.borderError;
        break;
      case 'warn':
        color = this.borderWarn;
        break;
    }
    const lines = content.split(`\n`);
    const length = ansiMaxLength(content);
    const top =
      TABLE_PARTS.top_left +
      ansiPadEnd(
        chalk.inverse('[ Legend ]'),
        length,
        undefined,
        TABLE_PARTS.top,
      ) +
      TABLE_PARTS.top_right;
    const bottom =
      TABLE_PARTS.bottom_left +
      TABLE_PARTS.bottom.repeat(length) +
      TABLE_PARTS.bottom_right;
    return [
      chalk.hex(color)(top),
      ...lines.map(
        (line) =>
          chalk.hex(color)(TABLE_PARTS.left) +
          line +
          chalk.hex(color)(TABLE_PARTS.right),
      ),
      chalk.hex(color)(bottom),
    ].join(`\n`);
  }

  public menuBar(
    [primary, secondary]: [string, string],
    state: 'active' | 'inactive',
  ): string {
    const maxWidth = this.maxWidth;
    let isBright = this.colorService.isBright(this.textImportant);

    let header = chalk
      .bgHex(this.textImportant)
      .hex(isBright ? '000000' : 'FFFFFF')(primary);
    // header = chalk`{${this.textImportant}  ${primary} }{blue${
    // is.empty(secondary) ? '.bgGray' : '.bgMagenta'
    // } ${PlIcons.honeycomb}}`;
    if (secondary) {
      isBright = this.colorService.isBright(this.textDetails);
      header += chalk
        .bgHex(this.textDetails)
        .hex(isBright ? '000000' : 'FFFFFF')(secondary);
      // header += chalk`{bgMagenta.black  ${secondary} }{magenta.bgGray ${PlIcons.honeycomb}}`;
    }
    header = ansiPadEnd(header, maxWidth, this.menuBg);
    return this.addBorder(header, state);
  }
}
