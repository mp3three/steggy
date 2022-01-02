import { Injectable, Scope } from '@nestjs/common';
import { DOWN, UP } from '@text-based/utilities';
import chalk from 'chalk';

import { tKeyMap } from '../../decorators';
import { ansiMaxLength, ansiPadEnd } from '../../includes';

type keyItem = {
  description: string;
  label: string;
};
const LINE_PADDING = 2;

@Injectable({ scope: Scope.TRANSIENT })
export class KeymapService {
  public keymapHelp(
    map: tKeyMap,
    {
      message = '',
      prefix = new Map(),
    }: { message?: string; prefix?: tKeyMap } = {},
  ): string {
    const a = this.buildLines(prefix);
    const b = this.buildLines(map);

    const biggestLabel = Math.max(
      ansiMaxLength(a.map((i) => i.label)),
      ansiMaxLength(b.map((i) => i.label)),
    );
    const help = [...a, ...b]
      .map(
        (item) =>
          chalk`  {blue.dim - }${ansiPadEnd(item.label, biggestLabel)}  ${
            item.description
          }`,
      )
      .join(`\n`);
    const maxLength =
      Math.max(
        ansiMaxLength(help.split(`\n`)),
        ansiMaxLength(message.split(`\n`)),
      ) + LINE_PADDING;
    return [' ', chalk.blue.dim('='.repeat(maxLength)), ` `, help].join(`\n`);
  }

  private buildLines(map: tKeyMap): keyItem[] {
    return [...map.entries()]
      .filter(([{ noHelp }]) => !noHelp)
      .map(([config, target]): keyItem => {
        const activate = config.catchAll
          ? chalk.yellow('default')
          : (Array.isArray(config.key) ? config.key : [config.key])
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
