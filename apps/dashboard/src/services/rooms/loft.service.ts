import { Inject, Injectable } from '@nestjs/common';
import { box as Box, Widgets } from 'blessed';
import { log as Log, Widgets as ContribWidgets } from 'blessed-contrib';

import { BLESSED_SCREEN } from '../../typings';
import { ApplicationService } from '../application.service';

@Injectable()
export class LoftService {
  // #region Object Properties

  private BOX: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly applicationService: ApplicationService,
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    this.BOX = this.applicationService.GRID.set(0, 0, 4, 2, Box, {
      draggable: true,
      fg: 'green',
      label: 'Loft State',
      scrollable: true,
      tags: true,
    } as Widgets.BoxOptions);
    const b = Box({
      content: 'test\ntest2',
      height: 'shrink',
      style: {
        bg: 'magenta',
      },
      width: '100%',
    });
    this.BOX.append(b);
    this.SCREEN.render();
    // console.log(JSON.stringify(b.height));
    this.BOX.append(
      Box({
        content: `test3\ntest32\n${JSON.stringify(
          b.height,
        )} - ${typeof b.height}\nasdf`,
        height: 'shrink',
        style: {
          bg: 'blue',
        },
        top: '20%',
        width: '100%',
      } as Widgets.BoxOptions),
    );

    this.SCREEN.render();
  }

  // #endregion Protected Methods
}
