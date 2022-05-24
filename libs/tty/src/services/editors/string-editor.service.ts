import { INVERT_VALUE, is, SINGLE, START } from '@steggy/utilities';
import chalk from 'chalk';

import {
  InquirerKeypressOptions,
  KeyModifiers,
  tKeyMap,
} from '../../contracts';
import { Editor, iBuilderEditor } from '../../decorators';
import { ansiPadEnd, ansiStrip } from '../../includes';
import { KeyboardManagerService, ScreenService } from '../meta';
import { KeymapService, TextRenderingService } from '../render';

export interface StringEditorRenderOptions {
  current: string;
  label?: string;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  validate?: (value: string) => true | string;
  width?: number;
}

const DEFAULT_PLACEHOLDER = 'enter value';
const ELLIPSES = '...';
const INTERNAL_PADDING = ' ';
const PADDING = 4;
const KEYMAP: tKeyMap = new Map<InquirerKeypressOptions, string>([
  [{ catchAll: true, noHelp: true }, 'onKeyPress'],
  [{ description: 'done', key: 'enter' }, 'onEnd'],
  [{ key: 'escape' }, 'reset'],
]);

@Editor({ type: 'string' })
export class StringEditorService
  implements iBuilderEditor<StringEditorRenderOptions>
{
  constructor(
    private readonly keyboardService: KeyboardManagerService,
    private readonly keymap: KeymapService,
    private readonly screenService: ScreenService,
    private readonly textRendering: TextRenderingService,
  ) {}

  private complete = false;
  private config: StringEditorRenderOptions;
  private done: (type: string) => void;
  private value: string;

  public configure(
    config: StringEditorRenderOptions,
    done: (type: unknown) => void,
  ) {
    this.config = config;
    this.complete = false;
    this.value = this.config.current ?? '';
    this.done = done;
    this.keyboardService.setKeyMap(this, KEYMAP);
  }

  public render(): void {
    if (this.complete) {
      this.screenService.render(
        chalk`{green ? } {bold ${this.config.label}} ${this.value}`,
      );
      return;
    }
    if (is.empty(this.value)) {
      return this.renderBox('bgBlue');
    }
    return this.renderBox('bgWhite');
  }

  protected onEnd() {
    this.complete = true;
    this.render();
    this.done(this.value);
    return false;
  }

  protected onKeyPress(key: string, { shift }: KeyModifiers) {
    if (key === 'backspace') {
      this.value = this.value.slice(START, INVERT_VALUE);
      return;
    }
    if (key === 'space') {
      this.value += ' ';
      return;
    }
    if (key === 'tab') {
      return;
    }
    if (key.length > SINGLE) {
      return;
    }
    this.value += shift ? key.toUpperCase() : key;
  }

  protected reset(): void {
    this.value = this.config.current;
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
