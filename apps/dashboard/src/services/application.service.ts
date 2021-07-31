import { Inject } from '@nestjs/common';
import { Widgets } from 'blessed';
import { grid as Grid } from 'blessed-contrib';

import { BlessedTheme } from '../includes';
import { BLESSED_SCREEN, BLESSED_THEME } from '../typings';
import { HealthService } from './health.service';
import { PicoAliasService } from './pico-alias.service';
import { RecentUpdatesService } from './recent-updates.service';
import { StatusService } from './status.service';

export class ApplicationService {
  // #region Object Properties

  public GRID: Grid;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
    @Inject(BLESSED_THEME) private readonly THEME: BlessedTheme,
    private readonly recentUpdates: RecentUpdatesService,
    private readonly statusService: HealthService,
    private readonly picoAlias: PicoAliasService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    this.recentUpdates.attachInstance(this.GRID);
    this.picoAlias.attachInstance(this.GRID);
    this.statusService.attachInstance(this.GRID);
    this.SCREEN.render();
  }

  protected onModuleInit(): void {
    this.GRID = new Grid({
      cols: 12,
      hideBorder: true,
      rows: 12,
      screen: this.SCREEN,
    });
  }

  // #endregion Protected Methods
}
