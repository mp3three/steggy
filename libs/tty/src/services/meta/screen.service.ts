import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EMPTY, is, SINGLE, START } from '@steggy/utilities';
import chalk from 'chalk';
import { ReadStream } from 'fs';
import MuteStream from 'mute-stream';
import { createInterface, Interface } from 'readline';

import { ansiEscapes, ansiStrip } from '../../includes';
import { ApplicationManagerService } from './application-manager.service';
import { EnvironmentService } from './environment.service';

const lastLine = content => content.split('\n').pop();
const PADDING = 2;
const height = content => content.split('\n').length + PADDING;
const DEFAULT_WIDTH = 80;

const output = new MuteStream();
output.pipe(process.stdout);

@Injectable()
export class ScreenService {
  constructor(
    @Inject(forwardRef(() => ApplicationManagerService))
    private readonly applicationManager: ApplicationManagerService,
    private readonly environmentService: EnvironmentService,
  ) {}
  public rl = createInterface({
    input: process.stdin,
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
    console.log(ansiEscapes.cursorBackward(amount));
  }

  public cursorRight(amount = SINGLE): void {
    console.log(ansiEscapes.cursorForward(amount));
  }

  public done() {
    this.rl.setPrompt('');
    console.log('\n');
  }

  public down(amount = SINGLE): void {
    if (amount === SINGLE) {
      console.log();
      return;
    }
    console.log(ansiEscapes.cursorDown(amount));
  }

  public eraseLine(amount = SINGLE): void {
    console.log(ansiEscapes.eraseLines(amount));
  }

  public async footerWrap<T>(callback: () => Promise<T>): Promise<T> {
    return await (async () => {
      //
      const result = await callback();
      return result;
    })();
  }

  public hr(width?: number): void {
    this.print(
      chalk.blue.dim(
        '='.repeat(width ?? this.environmentService.getDimensions().width),
      ),
    );
  }

  /**
   * console.log, with less options
   */
  public print(line = ''): void {
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
  public render(content: string, ...extra: string[]): void {
    this.lastContent = [content, extra];
    // Clear previous content
    console.log(ansiEscapes.eraseLines(this.height));

    const { width: maxWidth } = this.environmentService.getDimensions();
    content = this.breakLines(content, maxWidth);
    let bottomContent = is.empty(extra) ? `` : extra.join(`\n`);
    if (!is.empty(bottomContent)) {
      bottomContent = this.breakLines(bottomContent, maxWidth);
    }

    let stickyContent = '';
    if (this.sticky) {
      stickyContent = this.sticky[START];
    }

    // Calculate the total height of the rendered content
    const fullContent =
      (stickyContent ? `${stickyContent}\n` : '') +
      content +
      (bottomContent ? '\n' + bottomContent : '');
    this.height = height(fullContent);
    this.print(fullContent);
  }

  public up(amount = SINGLE): void {
    console.log(ansiEscapes.cursorUp(amount));
  }

  protected onModuleDestroy(): void {
    console.log(ansiEscapes.cursorShow);
  }

  protected onModuleInit(): void {
    console.log(ansiEscapes.cursorHide);
  }

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
