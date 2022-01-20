import { Injectable } from '@nestjs/common';

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
    private readonly componentExplorer: ComponentExplorerService,
    private readonly layoutManager: LayoutManagerService,
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
    this.screenService.clear();
    this.layoutManager.setHeader(main, secondary);
  }

  private reset(): void {
    this.activeApplication = undefined;
  }
}
