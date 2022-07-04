/* eslint-disable no-console */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  EMPTY,
  INCREMENT,
  is,
  LABEL,
  SINGLE,
  START,
  VALUE,
} from '@steggy/utilities';
import chalk from 'chalk';
import execa from 'execa';
import { ReadStream } from 'fs';
import MuteStream from 'mute-stream';
import { stdin, stdout } from 'process';
import { createInterface, Interface } from 'readline';

import { ansiEscapes, ansiMaxLength } from '../../includes';
import { ApplicationManagerService } from './application-manager.service';
import { EnvironmentService } from './environment.service';
import { KeyboardManagerService } from './keyboard-manager.service';

const PADDING = 2;
const height = content => content.split('\n').length + PADDING;

const output = new MuteStream();
output.pipe(stdout);

@Injectable()
export class ScreenService {
  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => KeyboardManagerService))
    private readonly keyboardService: KeyboardManagerService,
    @Inject(forwardRef(() => ApplicationManagerService))
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  public rl = createInterface({
    input: stdin,
    output,
    terminal: true,
  }) as Interface & { input: ReadStream; output: MuteStream };

  private height = EMPTY;
  private lastContent: [string, string[]];
  private sticky: [string, string[]];

  public clear(): void {
    this.height = EMPTY;
    this.rl.output.unmute();
    // Reset draw to top
    this.rl.output.write('\u001B[0f');
    // Clear screen
    this.rl.output.write('\u001B[2J');
    this.rl.output.mute();
  }

  public cursorLeft(amount = SINGLE): void {
    this.print(ansiEscapes.cursorBackward(amount));
  }

  public cursorRight(amount = SINGLE): void {
    this.print(ansiEscapes.cursorForward(amount));
  }

  /**
   * A shotgun attempt at returning the terminal to a normal state
   */
  public done() {
    this.rl.output.unmute();
    this.rl.setPrompt('');
    console.log(ansiEscapes.cursorShow);
  }

  /**
   * Move the rendering cursor down 1 row
   */
  public down(amount = SINGLE): void {
    this.rl.output.unmute();
    if (amount === SINGLE) {
      this.print();
      return;
    }
    this.print(ansiEscapes.cursorDown(amount));
    this.rl.output.mute();
  }

  /**
   * Delete line(s) and move cursor up
   */
  public eraseLine(amount = SINGLE): void {
    this.print(ansiEscapes.eraseLines(amount));
  }

  /**
   * - Capture the current render content as static content
   * - Deactivate current keyboard shortcuts
   * - Nest a new rendering session underneath the current
   * - DOES NOT DO MULTIPLE LEVELS!
   *
   * Intended use case is a dual editor situation. Ex:
   *
   * - Editable table cells where the table remains visible
   */
  public async footerWrap<T>(callback: () => Promise<T>): Promise<T> {
    this.sticky = this.lastContent;
    return await this.keyboardService.wrap(async () => {
      this.render();
      const result = await callback();
      this.print(ansiEscapes.eraseLines(height(this.sticky[START]) + PADDING));
      this.sticky = undefined;
      this.height = PADDING;
      // Next-render up to the calling service
      // The sticky content is stale now 🤷
      return result;
    });
  }

  public async pipe(child: execa.ExecaChildProcess): Promise<void> {
    this.rl.output.unmute();
    child.stdout.pipe(stdout);
    this.rl.output.mute();
    await child;
  }

  /**
   * console.log, with less options
   */
  public print(line: unknown = ''): void {
    this.rl.output.unmute();
    console.log(line);
    // Muting prevents user interactions from presenting to the screen directly
    // Must rely on application rendering to display keypresses
    this.rl.output.mute();
  }

  /**
   * Print content to the screen, maintaining an internal log of what happened
   * so that the content can be redrawn in place clearing out the previous render.
   */
  public async render(content?: string, ...extra: string[]): Promise<void> {
    if (
      !is.empty(this.lastContent) &&
      this.lastContent[LABEL] === content &&
      this.lastContent[VALUE].every((item, index) => extra[index] === item)
    ) {
      return;
    }
    this.lastContent = [content, extra];

    // footerWrap means new content is rendered below previous
    let stickyContent = '';
    if (this.sticky) {
      const header = this.sticky[START];
      stickyContent =
        header +
        `\n` +
        chalk.blue.dim(
          '='.repeat(
            Math.max(
              ansiMaxLength(header, content ?? ''),
              this.applicationManager.headerLength(),
            ),
          ),
        ) +
        `\n`;
    }

    if (is.empty(content)) {
      this.print(ansiEscapes.eraseLines(this.height) + stickyContent);
      this.height = 0;
      return;
    }

    const { width: maxWidth } = await this.environmentService.getDimensions();
    content = this.breakLines(content, maxWidth);

    // Intended for supplemental content
    // keyboard shortcut listings and such
    let bottomContent = is.empty(extra) ? `` : extra.join(`\n`);
    if (!is.empty(bottomContent)) {
      bottomContent = this.breakLines(bottomContent, maxWidth);
    }

    const fullContent = content + (bottomContent ? '\n' + bottomContent : '');

    this.print(ansiEscapes.eraseLines(this.height) + fullContent);
    // Increment to account for `eraseLines` being output at the same time as the new content
    this.height = height(fullContent) - INCREMENT;
  }

  /**
   * Move the rendering cursor up 1 line
   */
  public up(amount = SINGLE): void {
    this.print(ansiEscapes.cursorUp(amount));
  }

  protected onModuleDestroy(): void {
    this.done();
  }

  protected onModuleInit(): void {
    this.print(ansiEscapes.cursorHide);
  }

  /**
   * 🧙 Perform some witchcraft to chunk up lines that are too long
   */
  private breakLines(content: string, width: number): string {
    const regex = new RegExp(`(?:(?:\\033[[0-9;]*m)*.?){1,${width}}`, 'g');
    return content
      .split('\n')
      .flatMap(line => {
        const chunk = line.match(regex);
        chunk?.pop();
        return chunk || '';
      })
      .join('\n');
  }

  private clean(extraLines) {
    if (extraLines > EMPTY) {
      this.down(extraLines);
    }
    this.eraseLine(this.height);
  }
}
