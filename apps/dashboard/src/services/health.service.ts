import { MQTT_HEALTH_CHECK } from '@automagical/contracts/utilities';
import { Payload, Subscribe } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { box as Box, button as Button, Widgets } from 'blessed';
import blessed from 'blessed';
import {
  grid as Grid,
  log as Log,
  Widgets as ContribWidgets,
} from 'blessed-contrib';
import contrib from 'blessed-contrib';
import dayjs from 'dayjs';

import { BlessedTheme } from '../includes';
import { BLESSED_SCREEN, BLESSED_THEME } from '../typings';

@Injectable()
export class HealthService {
  // #region Object Properties

  private WIDGET: ContribWidgets.LogElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
    @Inject(BLESSED_THEME) private readonly THEME: BlessedTheme,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async attachInstance(grid: Grid): Promise<void> {
    const { style, border } = this.THEME.header;
    this.WIDGET = grid.set(6, 10, 6, 2, Log, {
      bg: style.bg,
      // border,
      draggable: true,
      fg: style.fg,
      label: 'Health Checks',
      scrollable: true,
      tags: true,
    } as ContribWidgets.LogOptions);
    this.SCREEN.render();
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Subscribe(MQTT_HEALTH_CHECK)
  protected onHealthCheck(@Payload() app: string): void {
    this.WIDGET.log(`${dayjs().format('HH:mm:ss')} ${app}`);
  }

  // #endregion Protected Methods
}
