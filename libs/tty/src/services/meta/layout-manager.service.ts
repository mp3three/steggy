import { Injectable } from '@nestjs/common';
import { HEADER_COLOR } from '@text-based/tty';
import { InjectConfig, is } from '@text-based/utilities';
import chalk from 'chalk';
import { Fonts } from 'figlet';

import {
  ApplicationStackProvider,
  iStackProvider,
  TABLE_PARTS,
} from '../../contracts';
import { PlIcons } from '../../icons';
import { ansiEscapes, ansiPadEnd, ansiStrip } from '../../includes';

type LayoutCache = { footer: string; header: string };
const CORNERS = 2;

@Injectable()
@ApplicationStackProvider()
export class LayoutManagerService implements iStackProvider {
  constructor(@InjectConfig(HEADER_COLOR) private readonly color: string) {}
  private footer: string;
  private header: string;

  public clearContent(): void {
    // console.log(ansiEscapes.eraseLines(this.height));
    //
  }

  public load({ header, footer }: LayoutCache): void {
    this.header = header;
    this.footer = footer;
  }

  public save(): LayoutCache {
    return {
      footer: this.footer,
      header: this.header,
    };
  }

  public setHeader(primary: string, secondary = ''): void {
    const [width] = process.stdout.getWindowSize();
    let header: string;
    header = chalk`{${this.color}  ${primary} }{blue${
      is.empty(secondary) ? '.bgGray' : '.bgMagenta'
    } ${PlIcons.honeycomb}}`;
    if (secondary) {
      header += chalk`{bgMagenta.black  ${secondary} }{magenta.bgGray ${PlIcons.honeycomb}}`;
    }
    header = ansiPadEnd(header, width - CORNERS, 'bgGray');
    this.header = header;
    const top =
      TABLE_PARTS.top_left +
      TABLE_PARTS.top.repeat(width - CORNERS) +
      TABLE_PARTS.top_right;
    const bottom =
      TABLE_PARTS.bottom_left +
      TABLE_PARTS.bottom.repeat(width - CORNERS) +
      TABLE_PARTS.bottom_right;
    console.log(top);
    console.log(TABLE_PARTS.left + this.header + TABLE_PARTS.right);
    console.log(bottom);
  }
}
