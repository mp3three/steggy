import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import { RefreshAfter } from '@automagical/terminal';
import { InjectMQTT } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { box as Box, button as Button, Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import { Client } from 'mqtt';

import { BLESSED_GRID } from '../../typings';

const BUTTON_SETTINGS = {
  align: 'center',
  height: 'shrink',
  mouse: true,
  padding: {
    bottom: 1,
    left: 10,
    right: 10,
    top: 1,
  },
  width: '100%',
  // shrink: true,
} as Widgets.ButtonOptions;

@Injectable()
export class LoftService {
  // #region Object Properties

  private BOX: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly GRID: ContribWidgets.GridElement,
    @InjectMQTT() private readonly mqttClient: Client,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @RefreshAfter()
  protected onApplicationBootstrap(): void {
    this.BOX = this.GRID.set(0, 2, 5, 2, Box, {
      draggable: true,
      fg: 'green',
      hideBorder: true,
      label: 'Loft State',
      scrollable: true,
      tags: true,
    });
    this.BOX.border = {};
    Button({
      content: 'Area On',
      parent: this.BOX,
      style: {
        bg: 'green',
        fg: 'black',
      },
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'areaOn'));
    });
    Button({
      content: 'Area Off',
      parent: this.BOX,
      style: {
        bg: 'red',
        fg: 'black',
      },
      top: 4,
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'areaOff'));
    });
    Button({
      content: 'Dim Up',
      parent: this.BOX,
      style: {
        bg: 'cyan',
        fg: 'black',
      },
      top: 8,
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'dimUp'));
    });
    Button({
      content: 'Dim Down',
      parent: this.BOX,
      style: {
        bg: 'yellow',
        fg: 'black',
      },
      top: 12,
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'dimDown'));
    });
    Button({
      content: 'Favorite',
      parent: this.BOX,
      style: {
        bg: 'magenta',
        fg: 'black',
      },
      top: 16,
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'favorite'));
    });
  }

  // #endregion Protected Methods
}
