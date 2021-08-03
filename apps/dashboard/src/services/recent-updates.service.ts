import { HassEventDTO } from '@automagical/contracts/home-assistant';
import { BLESSED_SCREEN } from '@automagical/contracts/terminal';
import { HASocketAPIService } from '@automagical/home-assistant';
import { RefreshAfter } from '@automagical/terminal';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import { log as Log, Widgets as ContribWidgets } from 'blessed-contrib';

import { BLESSED_GRID } from '../typings';

@Injectable()
export class RecentUpdatesService {
  // #region Object Properties

  private WIDGET: ContribWidgets.LogElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
    @Inject(BLESSED_GRID)
    private readonly GRID: ContribWidgets.GridElement,
    private readonly socketService: HASocketAPIService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @RefreshAfter()
  protected async onApplicationBootstrap(): Promise<void> {
    this.WIDGET = this.GRID.set(0, 10, 6, 2, Log, {
      draggable: true,
      label: 'HomeAssistant entity update stream',
      tags: true,
    } as ContribWidgets.LogOptions);
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
