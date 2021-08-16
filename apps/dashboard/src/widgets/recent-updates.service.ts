import { HassEventDTO } from '@automagical/contracts/home-assistant';
import {
  BLESSED_GRID,
  BLESSED_SCREEN,
  GridElement,
  Log,
  LogElement,
  LogOptions,
  Screen,
} from '@automagical/contracts/terminal';
import { HASocketAPIService } from '@automagical/home-assistant';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RecentUpdatesService {
  // #region Object Properties

  private WIDGET: LogElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Screen,
    @Inject(BLESSED_GRID)
    private readonly GRID: GridElement,
    private readonly socketService: HASocketAPIService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    this.WIDGET = this.GRID.set(0, 10, 6, 2, Log, {
      draggable: true,
      label: 'HomeAssistant entity update stream',
      tags: true,
    } as LogOptions);
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
