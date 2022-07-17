import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DOWN, is, UP } from '@steggy/utilities';
import chalk from 'chalk';

import { tKeyMap } from '../../contracts';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { ApplicationManagerService, KeyboardManagerService } from '../meta';
import { TextRenderingService } from './text-rendering.service';

type keyItem = {
  description: string;
  label: string;
};
const LINE_PADDING = 2;

@Injectable()
export class KeymapService {
  constructor(
    private readonly textRendering: TextRenderingService,
    @Inject(forwardRef(() => KeyboardManagerService))
    private readonly keyboardService: KeyboardManagerService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  public keymapHelp({
    message = '',
    prefix = new Map(),
    onlyHelp = false,
  }: { message?: string; onlyHelp?: boolean; prefix?: tKeyMap } = {}): string {
    const map = this.keyboardService.getCombinedKeyMap();
    const a = this.buildLines(prefix);
    const b = this.buildLines(map);

    const biggestLabel = ansiMaxLength(
      a.map(i => i.label),
      b.map(i => i.label),
    );
    const help = [...a, ...b]
      .map(
        item =>
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
      chalk.blue.dim(
        '='.repeat(Math.max(maxLength, this.applicationManager.headerLength())),
      ),
      ` `,
      this.textRendering.pad(help),
    ].join(`\n`);
  }

  private buildLines(map: tKeyMap): keyItem[] {
    return [...map.entries()]
      .filter(([{ powerUser, active }]) => {
        if (powerUser) {
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
          .map(([name]) => chalk.magenta(name));
        const modifiers = is.empty(active)
          ? ''
          : active.join('/') + chalk.cyan('+');
        const activate = config.catchAll
          ? chalk.yellow('default')
          : (Array.isArray(config.key)
              ? config.key.map(i => modifiers + i)
              : [modifiers + config.key]
            )
              .map(i => chalk.yellow.dim(i))
              .join(chalk.gray(', '));
        return {
          description: chalk.gray(config.description ?? target),
          label: activate,
        };
      })
      .sort((a, b) => (a.label > b.label ? UP : DOWN));
  }
}
