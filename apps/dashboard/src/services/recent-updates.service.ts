import { HassEventDTO } from '@automagical/contracts/home-assistant';
import { HASocketAPIService } from '@automagical/home-assistant';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import {
  grid as Grid,
  log as Log,
  Widgets as ContribWidgets,
} from 'blessed-contrib';

import { BLESSED_SCREEN } from '../typings';

@Injectable()
export class RecentUpdatesService {
  // #region Object Properties

  private WIDGET: ContribWidgets.LogElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
    private readonly socketService: HASocketAPIService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async attachInstance(grid: Grid): Promise<void> {
    this.WIDGET = grid.set(0, 10, 6, 2, Log, {
      draggable: true,
      fg: 'green',
      label: 'HomeAssistant entity update stream',
      scrollable: true,
      tags: true,
    } as ContribWidgets.LogOptions);
    this.SCREEN.render();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    this.socketService.EVENT_STREAM.subscribe((event: HassEventDTO) => {
      this.WIDGET.log(this.buildLine(event));
      this.SCREEN.render();
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  private buildLine(event: HassEventDTO): string {
    return `{bold}${event.data.entity_id}{/bold} => ${event?.data?.new_state?.state}`;
  }

  // #endregion Private Methods
}
