import { EMPTY, INCREMENT, INVERT_VALUE, is, START } from '@steggy/utilities';
import chalk from 'chalk';

import { InquirerKeypressOptions, tKeyMap } from '../../contracts';
import { Editor, iBuilderEditor } from '../../decorators';
import { ansiPadEnd, ansiStrip } from '../../includes';
import { KeyboardManagerService, ScreenService } from '../meta';
import { KeymapService, TextRenderingService } from '../render';

export interface NumberEditorRenderOptions {
  current: number;
  label?: string;
  locale?: boolean;
  max?: number;
  min?: number;
  placeholder?: string;
  width?: number;
}

const ELLIPSES = '...';
const PADDING = 4;
const DEFAULT_PLACEHOLDER = 'enter value';
const INTERNAL_PADDING = ' ';
const KEYMAP: tKeyMap = new Map<InquirerKeypressOptions, string>([
  [{ catchAll: true, noHelp: true }, 'onKeyPress'],
  [{ description: 'done', key: 'enter' }, 'onEnd'],
  [{ key: 'escape' }, 'reset'],
  [{ key: 'up' }, 'increment'],
  [{ key: 'down' }, 'decrement'],
]);

@Editor({ type: 'number' })
export class NumberEditorService
  implements iBuilderEditor<NumberEditorRenderOptions>
{
  constructor(
    private readonly keyboardService: KeyboardManagerService,
    private readonly keymap: KeymapService,
    private readonly screenService: ScreenService,
    private readonly textRendering: TextRenderingService,
  ) {}

  private complete = false;
  private config: NumberEditorRenderOptions;
  private done: (type: number) => void;
  private value: string;

  public configure(
    config: NumberEditorRenderOptions,
    done: (type: unknown) => void,
  ) {
    this.config = config;
    this.complete = false;
    this.reset();
    this.done = done;
    this.keyboardService.setKeyMap(this, KEYMAP);
  }

  public render(): void {
    if (this.complete) {
      this.screenService.render(
        chalk`{green ? } {bold ${this.config.label}} {gray ${Number(
          this.value,
        ).toLocaleString()}}`,
      );
      return;
    }
    if (is.empty(this.value)) {
      return this.renderBox('bgBlue');
    }
    return this.renderBox('bgWhite');
  }

  protected decrement(): void {
    this.value = (Number(this.value) - INCREMENT).toString();
  }

  protected increment(): void {
    this.value = (Number(this.value) + INCREMENT).toString();
  }

  protected onEnd() {
    this.complete = true;
    this.render();
    this.done(Number(this.value));
    return false;
  }

  protected onKeyPress(key: string): void {
    const current = this.value;
    if (key === '.' && current.includes('.')) {
      // Only 1 decimal point per number!
      return;
    }
    if ([...'.1234567890'].includes(key)) {
      this.value += key;
    }
    if (key === 'backspace' && !is.empty(current)) {
      this.value = this.value.slice(START, INVERT_VALUE);
    }
  }

  protected reset(): void {
    this.value = (this.config.current ?? EMPTY).toString();
  }

  private renderBox(bgColor: string): void {
    let value = is.empty(this.value)
      ? this.config.placeholder ?? DEFAULT_PLACEHOLDER
      : this.value;
    const maxLength = this.config.width - PADDING;
    const out: string[] = [];
    if (this.config.label) {
      out.push(chalk`{green ? } ${this.config.label}`);
    }

    const stripped = ansiStrip(value);
    let length = stripped.length;
    if (length > maxLength - ELLIPSES.length) {
      const update =
        ELLIPSES + stripped.slice((maxLength - ELLIPSES.length) * INVERT_VALUE);
      value = value.replace(stripped, update);
      length = update.length;
    }

    out.push(
      chalk[bgColor].black(
        ansiPadEnd(
          INTERNAL_PADDING + value + INTERNAL_PADDING,
          maxLength + PADDING,
        ),
      ),
    );
    const message = this.textRendering.pad(out.join(`\n`));
    this.screenService.render(
      message,
      this.keymap.keymapHelp({
        message,
      }),
    );
  }
}
