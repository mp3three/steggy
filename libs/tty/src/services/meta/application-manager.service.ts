import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { is } from '@text-based/utilities';

import { ApplicationStackProvider, iStackProvider } from '../../contracts';
import { iComponent } from '../../decorators';
import { ComponentExplorerService } from '../explorers';
import { PromptService } from '../prompt.service';
import { ScreenService } from './screen.service';

// ? Is there anything else that needs to be kept track of?

@Injectable()
@ApplicationStackProvider()
export class ApplicationManagerService implements iStackProvider {
  constructor(
    private readonly componentExplorer: ComponentExplorerService,
    @Inject(forwardRef(() => PromptService))
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
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
    this.promptService.clear();
    let header = this.promptService.scriptHeader(main);
    // this.screenService.setHeader()
    if (!is.empty(secondary)) {
      header += this.promptService.secondaryHeader(secondary);
    }
    this.screenService.setHeader(header);
  }

  private reset(): void {
    this.activeApplication = undefined;
  }
}
