import { Injectable } from '@nestjs/common';
import { EMPTY, is, SINGLE, START } from '@text-based/utilities';
import ansiEscapes from 'ansi-escapes';
import { ReadStream } from 'fs';
import MuteStream from 'mute-stream';
import { createInterface, Interface } from 'readline';

import { ansiMaxLength, ansiStrip } from '../../includes';

const height = (content) => content.split('\n').length;
const lastLine = (content) => content.split('\n').pop();
const DEFAULT_WIDTH = 80;

const output = new MuteStream();
output.pipe(process.stdout);
@Injectable()
export class ScreenService {
  public rl = createInterface({
    input: process.stdin,
    output,
    terminal: true,
  }) as Interface & { input: ReadStream; output: MuteStream };

  private extraLinesUnderPrompt = EMPTY;
  private height = EMPTY;

  public cursorLeft(amount = SINGLE): void {
    console.log(ansiEscapes.cursorBackward(amount));
  }

  public cursorRight(amount = SINGLE): void {
    console.log(ansiEscapes.cursorForward(amount));
  }

  public done() {
    this.releaseCursor();
    this.rl.setPrompt('');
    console.log('\n');
    // this.rl.close();
  }

  public down(amount = SINGLE): void {
    console.log(ansiEscapes.cursorDown(amount));
  }

  public eraseLine(amount = SINGLE): void {
    console.log(ansiEscapes.eraseLines(amount));
  }

  public releaseCursor() {
    if (this.extraLinesUnderPrompt > EMPTY) {
      this.down(this.extraLinesUnderPrompt);
    }
  }

  public render(content: string, ...extra: string[]): void {
    this.rl.output.unmute();
    this.clean(this.extraLinesUnderPrompt - 6);
    const promptLine = lastLine(content);
    const rawPromptLine = ansiStrip(promptLine);

    this.rl.setPrompt(
      this.rl.line.length > EMPTY
        ? rawPromptLine.slice(START, -this.rl.line.length)
        : rawPromptLine,
    );

    // SetPrompt will change cursor position, now we can get correct value
    const cursorPos = this.rl.getCursorPos();
    const width = this.width();

    content = this.breakLines(content, width);
    let bottomContent = is.empty(extra) ? `` : extra.join(`\n`);
    if (!is.empty(bottomContent)) {
      bottomContent = this.breakLines(bottomContent, width);
    }

    // Manually insert an extra line if we're at the end of the line.
    // This prevent the cursor from appearing at the beginning of the
    // current line.
    if (rawPromptLine.length % width === EMPTY) {
      content += '\n';
    }

    const fullContent = content + (bottomContent ? '\n' + bottomContent : '');
    console.log(fullContent);

    // Re-adjust the cursor at the correct position.

    // We need to consider parts of the prompt under the cursor as part of the bottom
    // content in order to correctly cleanup and re-render.
    const promptLineUpDiff =
      Math.floor(rawPromptLine.length / width) - cursorPos.rows;
    const bottomContentHeight =
      promptLineUpDiff + (bottomContent ? height(bottomContent) : EMPTY);
    if (bottomContentHeight > EMPTY) {
      this.up(bottomContentHeight);
    }

    // Reset cursor at the beginning of the line
    this.cursorLeft(ansiMaxLength(lastLine(fullContent)));

    // Adjust cursor on the right
    if (cursorPos.cols > EMPTY) {
      this.cursorRight(cursorPos.cols);
    }

    // Set up state for next re-rendering
    this.extraLinesUnderPrompt = bottomContentHeight;
    this.height = height(fullContent);
    this.rl.output.mute();
  }

  public up(amount = SINGLE): void {
    console.log(ansiEscapes.cursorUp(amount));
  }

  protected onModuleInit(): void {
    console.log(ansiEscapes.cursorHide);
  }

  private breakLines(content: string, width: number): string {
    const regex = new RegExp(`(?:(?:\\033[[0-9;]*m)*.?){1,${width}}`, 'g');
    return content
      .split('\n')
      .flatMap((line) => {
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

  private width(): number {
    if (process.stdout.getWindowSize) {
      return process.stdout.getWindowSize()[START] || DEFAULT_WIDTH;
    }
    if (process.stdout.columns) {
      return process.stdout.columns;
    }
    return DEFAULT_WIDTH;
  }
}
