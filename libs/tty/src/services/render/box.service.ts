import { Injectable, Scope } from '@nestjs/common';
import { is } from '@text-based/utilities';

import { TABLE_PARTS } from '../../contracts';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { ThemeService } from '../meta';

@Injectable({ scope: Scope.TRANSIENT })
export class BoxService {
  constructor(private readonly themeService: ThemeService) {}
  /**
   * Hex
   */
  public borderColor: string;
  /**
   * Internal box contents. Multiline string
   */
  public content: string;
  /**
   * % of screen
   */
  public height: number;
  /**
   * Border legend text
   */
  public legend: string;
  /**
   * % of screen
   */
  public width: number;
  /**
   * Render position cache
   */
  public x?: number;
  /**
   * Render position cache
   */
  public y?: number;

  public render(): string {
    const maxWidth = ansiMaxLength(this.content.split(`\n`));
    const header = (
      is.empty(this.legend)
        ? [
            TABLE_PARTS.top_left,
            this.legend,
            TABLE_PARTS.top.repeat(maxWidth - ansiMaxLength(this.legend)),
            TABLE_PARTS.top_right,
          ]
        : [
            TABLE_PARTS.top_left,
            TABLE_PARTS.top.repeat(maxWidth),
            TABLE_PARTS.top_right,
          ]
    ).join(``);
    const content = this.content
      .split(`\n`)
      .map(
        (line) =>
          TABLE_PARTS.left + ansiPadEnd(line, maxWidth) + TABLE_PARTS.right,
      )
      .join(`\n`);
    const footer = [
      TABLE_PARTS.bottom_left,
      TABLE_PARTS.bottom.repeat(maxWidth),
      TABLE_PARTS.bottom_right,
    ].join(``);
    return [header, content, footer].join(`\n`);
  }
}
