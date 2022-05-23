import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EMPTY, is, SINGLE, START } from '@steggy/utilities';
import chalk from 'chalk';
import { ReadStream } from 'fs';
import MuteStream from 'mute-stream';
import { createInterface, Interface } from 'readline';

import { ansiEscapes, ansiStrip } from '../../includes';
import { ApplicationManagerService } from './application-manager.service';

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
  ) {}
  public rl = createInterface({
    input: process.stdin,
    output,
    terminal: true,
  }) as Interface & { input: ReadStream; output: MuteStream };

  private height = EMPTY;

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

  public getWidth(): number {
    if (process.stdout.getWindowSize) {
      return process.stdout.getWindowSize()[START] || DEFAULT_WIDTH;
    }
    if (process.stdout.columns) {
      return process.stdout.columns;
    }
    return DEFAULT_WIDTH;
  }

  public hr(width?: number): void {
    this.print(chalk.blue.dim('='.repeat(width ?? this.getWidth())));
  }

  public print(line = ''): void {
    console.log(line);
  }

  public render(content: string, ...extra: string[]): void {
    this.rl.output.unmute();
    console.log(ansiEscapes.eraseLines(this.height));
    const promptLine = lastLine(content);
    const rawPromptLine = ansiStrip(promptLine);

    const [width] = process.stdout.getWindowSize
      ? process.stdout.getWindowSize() || [EMPTY]
      : [EMPTY];

    content = this.breakLines(content, width);
    let bottomContent = is.empty(extra) ? `` : extra.join(`\n`);
    if (!is.empty(bottomContent)) {
      bottomContent = this.breakLines(bottomContent, width);
    }

    if (rawPromptLine.length % width === EMPTY) {
      content += '\n';
    }

    const fullContent = content + (bottomContent ? '\n' + bottomContent : '');
    console.log(fullContent);
    this.height = height(fullContent);

    // Muting prevents user interactions from presenting to the screen directly
    // Must rely on application rendering to display keypresses
    this.rl.output.mute();
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
