import { Inject, Injectable } from '@nestjs/common';
import { box as Box, button as Button, Widgets } from 'blessed';
import blessed from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import contrib from 'blessed-contrib';

import { BLESSED_SCREEN } from '../../typings';
import { LoftService } from './loft.service';

@Injectable()
export class RoomCarouselService {
  // #region Object Properties

  private WIDGET: ContribWidgets.LogElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,

    private readonly loftService: LoftService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    // this.node = new contrib.carousel([() => this.page1()], {
    //   controlKeys: true,
    //   interval: 1000,
    //   screen: this.SCREEN,
    // });
    // this.SCREEN.render();
  }

  // #endregion Protected Methods
}
