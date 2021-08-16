import {
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@automagical/contracts/home-assistant';
import {
  BLESSED_GRID,
  GridElement,
  Log,
  LogElement,
  LogOptions,
} from '@automagical/contracts/terminal';
import { LogLevels } from '@automagical/contracts/utilities';
import { HASocketAPIService } from '@automagical/home-assistant';
import { Workspace } from '@automagical/terminal';
import { OnEvent } from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';

import { WorkspaceElement } from '../decorators';
import { MDIIcons } from '../icons';

@Workspace({
  friendlyName: 'Home Assistant',
  menu: [chalk` ${MDIIcons.home_assistant}  {bold Home Assistant}`],
  name: 'homeassistant',
})
export class HomeAssistantWorkspace {
  // #region Object Properties

  public level: LogLevels;

  @WorkspaceElement()
  private WIDGET: LogElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID)
    private readonly GRID: GridElement,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    this.WIDGET = this.GRID.set(3, 2, 9, 8, Log, {
      alwaysScroll: true,
      fg: 'cyan',
      hidden: true,
      label: 'Logger',
      mouse: true,
      scrollable: true,
      scrollbar: {
        style: {
          bg: 'yellow',
        },
      },
    } as LogOptions);
  }

  // #endregion Protected Methods

  // #region Private Methods

  @OnEvent(HA_EVENT_STATE_CHANGE)
  private addLine(event: HassEventDTO) {
    this.WIDGET.log(this.buildLine(event));
  }

  private buildLine(event: HassEventDTO): string {
    return chalk`{bold ${event.data.entity_id}} => ${
      event?.data?.new_state?.state
    } {grey ${JSON.stringify(event?.data?.new_state?.attributes || {})}}`;
  }

  // #endregion Private Methods
}
