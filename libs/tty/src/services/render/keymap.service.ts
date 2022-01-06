import { Injectable } from '@nestjs/common';
import { DOWN, is, UP } from '@text-based/utilities';
import chalk from 'chalk';

import { tKeyMap } from '../../contracts';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { TextRenderingService } from './text-rendering.service';

type keyItem = {
  description: string;
  label: string;
};
const LINE_PADDING = 2;

@Injectable()
export class KeymapService {
  constructor(private readonly textRendering: TextRenderingService) {}

  public keymapHelp(
    map: tKeyMap,
    {
      message = '',
      prefix = new Map(),
      onlyHelp = false,
    }: { message?: string; onlyHelp?: boolean; prefix?: tKeyMap } = {},
  ): string {
    const a = this.buildLines(prefix);
    const b = this.buildLines(map);

    const biggestLabel = ansiMaxLength(
      a.map((i) => i.label),
      b.map((i) => i.label),
    );
    const help = [...a, ...b]
      .map(
        (item) =>
          chalk`{blue.dim > }${ansiPadEnd(item.label, biggestLabel)}  ${
            item.description
          }`,
      )
      .join(`\n`);
    if (onlyHelp) {
      return help;
    }
    const maxLength =
      ansiMaxLength(help.split(`\n`), message.split(`\n`)) + LINE_PADDING;
    return [
      chalk.blue.dim('='.repeat(maxLength)),
      ` `,
      this.textRendering.pad(help),
    ].join(`\n`);
  }

  private buildLines(map: tKeyMap): keyItem[] {
    return [...map.entries()]
      .filter(([{ noHelp, active }]) => {
        if (noHelp) {
          return false;
        }
        if (active) {
          return active();
        }
        return true;
      })
      .map(([config, target]): keyItem => {
        const active = Object.entries({ ...config.modifiers })
          .filter(([, state]) => state)
          .map(([name]) => name);
        const modifiers = is.empty(active) ? '' : active.join('/') + '-';
        const activate = config.catchAll
          ? chalk.yellow('default')
          : (Array.isArray(config.key)
              ? config.key.map((i) => modifiers + i)
              : [modifiers + config.key]
            )
              .map((i) => chalk.yellow.dim(i))
              .join(chalk.gray(', '));
        return {
          description: chalk.gray(config.description ?? target),
          label: activate,
        };
      })
      .sort((a, b) => (a.label > b.label ? UP : DOWN));
  }
}
