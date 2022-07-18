import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';
import { is } from '@steggy/utilities';
import chalk from 'chalk';
import figlet, { Fonts } from 'figlet';

import { DEFAULT_HEADER_FONT, SECONDARY_HEADER_FONT } from '../../config';
import { ApplicationStackProvider, iStackProvider } from '../../contracts';
import { iBuilderEditor, iComponent } from '../../decorators';
import { ansiMaxLength } from '../../includes';
import { ComponentExplorerService, EditorExplorerService } from '../explorers';
import { KeyboardManagerService } from './keyboard-manager.service';
import { ScreenService } from './screen.service';

// ? Is there anything else that needs to be kept track of?
const LINE_PADDING = 2;

@Injectable()
@ApplicationStackProvider()
export class ApplicationManagerService implements iStackProvider {
  constructor(
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly primaryFont: Fonts,
    @InjectConfig(SECONDARY_HEADER_FONT) private readonly secondaryFont: Fonts,
    private readonly editorExplorer: EditorExplorerService,
    private readonly componentExplorer: ComponentExplorerService,
    @Inject(forwardRef(() => ScreenService))
    private readonly screenService: ScreenService,
    @Inject(forwardRef(() => KeyboardManagerService))
    private readonly keyboard: KeyboardManagerService,
  ) {}

  public activeApplication: iComponent;
  private activeEditor: iBuilderEditor;
  private header = '';

  public async activateComponent<CONFIG, VALUE>(
    name: string,
    configuration: CONFIG = {} as CONFIG,
  ): Promise<VALUE> {
    this.reset();
    const old = this.activeApplication;
    const out = await this.keyboard.wrap<VALUE>(async () => {
      const promise = new Promise<VALUE>(done => {
        const component = this.componentExplorer.findServiceByType<
          CONFIG,
          VALUE
        >(name);
        // There needs to be more type work around this
        // It's a disaster
        component.configure(configuration, value => {
          done(value as VALUE);
        });
        this.activeApplication = component;
        component.render();
      });
      this.activeEditor = undefined;
      const result = await promise;
      this.activeApplication = old;
      return result;
    });
    return out;
  }

  public async activateEditor<CONFIG, VALUE>(
    name: string,
    configuration: CONFIG = {} as CONFIG,
  ): Promise<VALUE> {
    return await this.keyboard.wrap<VALUE>(async () => {
      const component = this.activeApplication;
      this.activeApplication = undefined;
      const promise = new Promise<VALUE>(done => {
        const editor = this.editorExplorer.findServiceByType(name);
        editor.configure(configuration, value => done(value as VALUE));
        this.activeEditor = editor;
        editor.render();
      });
      const result = await promise;
      this.activeEditor = undefined;
      this.activeApplication = component;
      return result;
    });
  }

  public headerLength(): number {
    return ansiMaxLength(this.header) + LINE_PADDING;
  }

  public load(item: iComponent): void {
    this.activeApplication = item;
  }

  public render(): void {
    this.activeApplication?.render();
    this.activeEditor?.render();
  }

  public save(): Partial<iComponent> {
    return this.activeApplication;
  }

  public setHeader(primary: string, secondary = ''): number {
    this.screenService.clear();
    this.screenService.printLine();
    let max = 0;
    if (!is.empty(secondary)) {
      primary = figlet.textSync(primary, {
        font: this.primaryFont,
      });
      const text = chalk
        .cyan(primary)
        .split(`\n`)
        .map(i => `  ${i}`)
        .join(`\n`);
      max = ansiMaxLength(text);
      this.screenService.printLine(`\n` + text);
    } else {
      secondary = primary;
      primary = '';
    }
    if (is.empty(secondary)) {
      this.header = primary;
      return;
    }
    secondary = figlet.textSync(secondary, {
      font: this.secondaryFont,
    });
    secondary = chalk
      .magenta(secondary)
      .split(`\n`)
      .map(i => `  ${i}`)
      .join(`\n`);
    max = Math.max(max, ansiMaxLength(secondary));
    this.screenService.printLine(secondary);
    this.header = `${primary}\n${secondary}`;
    return max;
  }

  public wrap<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise(async done => {
      const application = this.activeApplication;
      const result = await callback();
      this.activeApplication = application;
      done(result);
    });
  }

  private reset(): void {
    this.activeApplication = undefined;
    this.activeEditor = undefined;
  }
}
