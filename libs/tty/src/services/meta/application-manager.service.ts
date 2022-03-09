import { InjectConfig } from '@automagical/boilerplate';
import { is } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import figlet, { Fonts } from 'figlet';

import {
  DEFAULT_HEADER_FONT,
  HEADER_COLOR,
  SECONDARY_HEADER_FONT,
} from '../../config';
import { ApplicationStackProvider, iStackProvider } from '../../contracts';
import { iComponent } from '../../decorators';
import { ComponentExplorerService } from '../explorers';
import { LayoutManagerService } from './layout-manager.service';
import { ScreenService } from './screen.service';

// ? Is there anything else that needs to be kept track of?

@Injectable()
@ApplicationStackProvider()
export class ApplicationManagerService implements iStackProvider {
  constructor(
    @InjectConfig(HEADER_COLOR) private readonly color: string,
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly primaryFont: Fonts,
    @InjectConfig(SECONDARY_HEADER_FONT) private readonly secondaryFont: Fonts,
    private readonly componentExplorer: ComponentExplorerService,
    private readonly layoutManager: LayoutManagerService,
    private readonly screenService: ScreenService,
  ) {}
  private activeApplication: iComponent;
  private header: string;

  public async activate<CONFIG, VALUE>(
    name: string,
    configuration: CONFIG = {} as CONFIG,
  ): Promise<VALUE> {
    this.reset();
    return await new Promise(done => {
      const component = this.componentExplorer.findServiceByType<CONFIG, VALUE>(
        name,
      );
      // There needs to be more type work around this
      // It's a disaster
      component.configure(configuration, value => {
        done(value as VALUE);
      });
      this.activeApplication = component;
      component.render();
    });
  }

  public load(item: iComponent): void {
    this.activeApplication = item;
  }

  public render(): void {
    this.activeApplication.render();
  }

  public save(): Partial<iComponent> {
    return this.activeApplication;
  }

  public setHeader(primary: string, secondary = ''): void {
    this.screenService.clear();
    primary = figlet.textSync(primary, {
      font: this.primaryFont,
    });
    this.screenService.print(
      `\n` +
        chalk
          .cyan(primary)
          .split(`\n`)
          .map(i => `  ${i}`)
          .join(`\n`),
    );
    if (is.empty(secondary)) {
      return;
    }
    secondary = figlet.textSync(secondary, {
      font: this.secondaryFont,
    });
    this.screenService.print(
      chalk
        .magenta(secondary)
        .split(`\n`)
        .map(i => `  ${i}`)
        .join(`\n`),
    );

    //  header.split(`\n`).pop().length;
  }

  private reset(): void {
    this.activeApplication = undefined;
  }
}
