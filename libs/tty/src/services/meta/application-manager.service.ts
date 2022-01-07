import { Injectable } from '@nestjs/common';
import { InjectConfig, is } from '@text-based/utilities';
import chalk from 'chalk';
import figlet, { Fonts } from 'figlet';

import { DEFAULT_HEADER_FONT, SECONDARY_HEADER_FONT } from '../../config';
import { ApplicationStackProvider, iStackProvider } from '../../contracts';
import { iComponent } from '../../decorators';
import { ComponentExplorerService } from '../explorers';
import { TextRenderingService } from '../render';
import { ScreenService } from './screen.service';

// ? Is there anything else that needs to be kept track of?

@Injectable()
@ApplicationStackProvider()
export class ApplicationManagerService implements iStackProvider {
  constructor(
    private readonly componentExplorer: ComponentExplorerService,
    private readonly screenService: ScreenService,
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: Fonts,
    private readonly textRendering: TextRenderingService,
    @InjectConfig(SECONDARY_HEADER_FONT) private readonly secondaryFont: Fonts,
  ) {}

  private activeApplication: iComponent;

  public async activate<CONFIG, VALUE>(
    name: string,
    configuration: CONFIG,
  ): Promise<VALUE> {
    this.reset();
    return await new Promise((done) => {
      const component = this.componentExplorer.findServiceByType<CONFIG, VALUE>(
        name,
      );
      // There needs to be more type work around this
      // It's a disaster
      component.configure(configuration, (value) => {
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

  public setHeader(main: string, secondary?: string): void {
    this.screenService.clear();
    let header = this.scriptHeader(main);
    // this.screenService.setHeader()
    if (!is.empty(secondary)) {
      header += this.secondaryHeader(secondary);
    }
    this.screenService.setHeader(header);
  }

  private reset(): void {
    this.activeApplication = undefined;
  }

  private scriptHeader(header: string, color = 'cyan'): string {
    header = figlet.textSync(header, {
      font: this.font,
    });
    const message = `\n` + this.textRendering.pad(chalk[color](header));
    console.log(message);
    return message;
  }

  private secondaryHeader(header: string, color = 'magenta'): string {
    header = figlet.textSync(header, {
      font: this.secondaryFont,
    });
    const message = this.textRendering.pad(chalk[color](header));
    console.log(message);
    return message;
  }
}
