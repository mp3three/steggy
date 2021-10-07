import {
  HA_EVENT_STATE_CHANGE,
  HassEventDTO,
} from '@automagical/home-assistant';
import {
  BLESSED_GRID,
  GridElement,
  Log,
  LogElement,
  LogOptions,
} from '@automagical/terminal';
import { LogLevels } from '@automagical/utilities';
import { OnEvent } from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';

import { Workspace, WorkspaceElement } from '../decorators';
import { MDIIcons } from '../../../tty/src/icons';

@Workspace({
  friendlyName: 'Home Assistant',
  menu: [chalk` ${MDIIcons.home_assistant}  {bold Home Assistant}`],
  name: 'homeassistant',
})
export class HomeAssistantWorkspace {
  public level: LogLevels;

  @WorkspaceElement()
  private WIDGET: LogElement;

  constructor(
    @Inject(BLESSED_GRID)
    private readonly GRID: GridElement,
  ) {}

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

  @OnEvent(HA_EVENT_STATE_CHANGE)
  private addLine(event: HassEventDTO) {
    this.WIDGET.log(this.buildLine(event));
  }

  private buildLine(event: HassEventDTO): string {
    return chalk`{bold ${event.data.entity_id}} => ${
      event?.data?.new_state?.state
    } {grey ${JSON.stringify(event?.data?.new_state?.attributes || {})}}`;
  }
}
