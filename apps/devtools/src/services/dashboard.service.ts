import { CLIService } from '@automagical/contracts/terminal';
import { MainCLIREPL } from '@automagical/terminal';
import { Injectable } from '@nestjs/common';
import blessed from 'blessed';

import { RecentUpdatesService } from '../dashboard';

@Injectable()
export class DashboardService implements CLIService {
  // #region Object Properties

  public description = [];
  public name = 'Dashboard';

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly cli: MainCLIREPL,
    private readonly recentUpdates: RecentUpdatesService,
  ) {
    cli.addScript(this);
  }

  // #endregion Constructors

  // #region Public Methods

  public async exec(): Promise<void> {
    const screen = blessed.screen({
      smartCSR: true,
    });
    screen.title = 'my window title';
    this.recentUpdates.appendTo(screen);

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function (ch, key) {
      // eslint-disable-next-line unicorn/no-process-exit
      return process.exit(0);
    });

    // Render the screen.
    screen.render();
  }

  // #endregion Public Methods
}
